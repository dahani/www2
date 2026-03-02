// ignore_for_file: use_build_context_synchronously

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:better_player_plus/better_player_plus.dart';
import 'package:dio/dio.dart';
import 'package:dlna/screens/favourite.dart';
import 'package:dlna/screens/movies.dart';
import 'package:dlna/screens/scanTest.dart';
import 'package:dlna/services/constant.dart';
import 'package:dlna/services/database_service.dart';
import 'package:dlna/services/dlnaProvider.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:dlna/services/functions.dart';
import 'package:dlna/widgest/controls.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:hardware_button_listener/hardware_button_listener.dart';
import 'package:hardware_button_listener/models/hardware_button.dart';
import 'package:provider/provider.dart';
import 'package:screen_brightness/screen_brightness.dart';
import 'package:share_plus/share_plus.dart';
import 'package:volume_controller/volume_controller.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class DlnaHomePage extends StatefulWidget {
  const DlnaHomePage({super.key});

  @override
  State<DlnaHomePage> createState() => _DlnaHomePageState();
}

class _DlnaHomePageState extends State<DlnaHomePage>
    with SingleTickerProviderStateMixin {
  late DlnaService dlnaService;

  final Dio _dio = Dio();

  Map<String, dynamic>? _selectedCategory;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = "";

  List<Map<String, dynamic>> _searchResults = [];
  bool _isSearching = false;

  // 🔹 Loading flags
  bool _isLoadingChannels = true;
  final _hardwareButtonListener = HardwareButtonListener();
  late StreamSubscription<HardwareButton> _buttonSubscription;

  List<Map<String, dynamic>> _categories = [];
  List<Map<String, dynamic>> _channels = [];
  List<Map<String, dynamic>> _favoriteChannels = [];
  int selecteChannelIndex = -1;
  Timer? _sleepTimer;
  int? _selectedMinutes;
  late TabController _tabController;
  bool autoShowController=false;
  bool _loadingFavs=true;
  @override
  void initState() {
    super.initState();
    dlnaService = Provider.of<DlnaProvider>(context, listen: false).dlnaService;
    startListeningToHardwareButtons();
    _tabController = TabController(length: 2, vsync: this);
    getCats(isFirst: true);
    VolumeController().showSystemUI = false;
_tabController.addListener(() {
  if(_tabController.index==1){
    _refreshFavorites() ;
  }
},);

  }

  @override
  void dispose() {
    _buttonSubscription.cancel();
    // _betterPlayerController.removeEventsListener(_handllerEvents);

    super.dispose();
  }

  void _refreshFavorites() async {setState(() {
    _loadingFavs=true;
  });
    final favs = await DatabaseService.instance
        .getFavourites();
    setState(() {
      _favoriteChannels = favs;_loadingFavs=false;
    });
  }

void _showSleepTimerSheet() {
  showModalBottomSheet(
    context: context,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (_) {
      return SleepTimerSheet(
        selectedMinutes: _selectedMinutes,
        onSelectDuration: (minutes) {
          _startSleepTimer(minutes);
        },
        onCancel: () {
          _cancelSleepTimer();
        },
      );
    },
  );
}

  void startListeningToHardwareButtons() {
    _buttonSubscription = _hardwareButtonListener.listen((event) {
      if (event.buttonName.toString() == "VOLUME_UP") {
        dlnaService.volumeUp();
      } else if (event.buttonName.toString() == "VOLUME_DOWN") {
        dlnaService.volumeDown();
      }
    });
  }

  void _startSleepTimer(int minutes) {
    _sleepTimer?.cancel();

    _selectedMinutes = minutes;

    _sleepTimer = Timer(Duration(minutes: minutes), () async {
      await _shutdownProcedure();
    });

    Fluttertoast.showToast(msg: "Sleep timer set for $minutes minutes");
  }

  void _cancelSleepTimer() {
    _sleepTimer?.cancel();
    _sleepTimer = null;
    _selectedMinutes = null;
  }

  Future<void> _shutdownProcedure() async {
    // Stop media
    try {
      if (dlnaService.isConnected && dlnaService.selectedDevice != null) {
        await dlnaService.stop();
      }
    } catch (_) {}

    // Exit app
    if (Platform.isAndroid) {
      exit(0);
    }
  }

  Future<void> _loadChannels() async {
    setState(() => _isLoadingChannels = true);

    try {
      final resp = await _dio.get(JSON_URL);

      if (resp.statusCode == 200) {
        final List data = resp.data;
        await DatabaseService.instance.insertFullJson(data);
      }
    } catch (e) {
      debugPrint("JSON error: $e");
    }

    getCats(isFirst: true);
    setState(() => _isLoadingChannels = false);
  }

  Future<void> _searchFromDb(String query) async {
    if (query.isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults.clear();
      });
      return;
    }

    final results = await DatabaseService.instance.searchChannels(query);

    setState(() {
      _isSearching = true;
      _searchResults = results;
    });
  }

  void _showQualitySelector(Map<String, dynamic> ch, int indexd) {
    final resolutions = jsonDecode(ch['resolutions']) as Map<String, dynamic>;
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: ListView(
          children: resolutions.entries.map((entry) {
            final quality = entry.key;
            final url = entry.value['url'];
            ch['url'] = url;
            return Padding(
              padding: const EdgeInsets.all(8.0),
              child: ListTile(
                title: Text(quality.toUpperCase()),
                onTap: () {
                  Navigator.pop(context);
                  if (!dlnaService.isConnected ||
                      dlnaService.selectedDevice == null) {
                    _showControlsBottomSheetPlayer(ch);

                  } else {
                    _play(ch);
                  }
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  void playCh(dynamic ch) {
    dlnaService.setChannel(ch);
    setState(() {
      _play(ch);
    });
  }

  void prevNext(int step) {
    if (!dlnaService.isConnected || dlnaService.selectedDevice == null) {
      Fluttertoast.showToast(msg: "Connect Tv");
      return;
    }

    final List<Map<String, dynamic>> source = _tabController.index == 0
        ? (_isSearching ? _searchResults : _channels)
        : _favoriteChannels;
    if (source.isEmpty) return null;
    selecteChannelIndex =
        (selecteChannelIndex + step + source.length) % source.length;
    final ch = source[selecteChannelIndex];
    playCh(ch);
  }

  dynamic _changeChannel(int step) {
    final List<Map<String, dynamic>> source = _isSearching
        ? _searchResults
        : _channels;

    if (source.isEmpty) return null;
    selecteChannelIndex =
        (selecteChannelIndex + step + source.length) % source.length;
    final selected = source[selecteChannelIndex];
    setState(() {
      dlnaService.setChannel(selected);
    });

    return selected;
  }

void _openSettings(BuildContext context) {

  showModalBottomSheet(
  context: context,
  isScrollControlled: true,
  builder: (context) {
    return StatefulBuilder(
      builder: (context, setModalState) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (context, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                borderRadius:
                    BorderRadius.vertical(top: Radius.circular(30)),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 12),
                  Container(
                    width: 50,
                    height: 5,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  const SizedBox(height: 20),

                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        "Settings",
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  Expanded(
                    child: ListView(
                      controller: scrollController,
                      children: [
                        ListTile(
                          leading: const Icon(Icons.timer),
                          title: const Text("Sleep Timer"),
                          onTap: _showSleepTimerSheet,
                        ),
                        ListTile(
                          leading: const Icon(Icons.timer),
                          title: const Text("Play Url"),
                          onTap: () async{
                            final result = await showInputDialog(context);

                                if (result != null && result.isNotEmpty) {
                                  final ch=({'id':23,"name":"Url Test","url":result});
                                  if (!dlnaService.isConnected || dlnaService.selectedDevice == null) {
                                _showControlsBottomSheetPlayer(ch);
                                  }else {
                                    _play(ch);
                                  }
                                }
                          },
                        ),

                        CheckboxListTile(
                          value: autoShowController,
                          onChanged: (bool? value) {
                            setState(() {
                              autoShowController = value ?? false;
                            });

                            setModalState(() {});
                          },
                          title: const Text(
                            "Auto show Controls",
                            style: TextStyle(
                                fontWeight: FontWeight.w600),
                          ),
                          subtitle:const Text("Show controls after channel played"),
                          secondary:
                              const Icon(Icons.notifications),
                          controlAffinity:
                              ListTileControlAffinity.trailing,
                        ),
                        ListTile(
                          leading: const Icon(Icons.perm_scan_wifi_outlined),
                          title: const Text("Scan test"),
                          onTap: (){
                            Navigator.push(context,MaterialPageRoute(builder: (_) =>RealScannerScreen(  ),),);
                          },
                        ),
                        ListTile(
                          leading: const Icon(Icons.favorite_outline),
                          title: const Text("Favourite"),
                          onTap: (){
                            Navigator.push(context,MaterialPageRoute(builder: (_) =>FavouritesPage(  ),),);
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  },
);
}

  void _showControlsBottomSheet() {
 if (!dlnaService.isConnected || dlnaService.selectedDevice == null) return;
    showModalBottomSheet(
  context: context,
  isScrollControlled: true,
  backgroundColor: Colors.transparent,
  builder: (context) => TVControlBottomSheet(
    onlcik:(command, val)async{
      //print("ccc $command");
      if(command=="prev"){
          prevNext(-1);
      }else if(command=="next"){
          prevNext(1);
      }else if(command=="stop"){
        await dlnaService.stop();
      }else if(command=="prevChannel"){
        _play(dlnaService.lastSelectedChannel);
        setState(() {

        });
      }
    },
  ),
);



  }

  void getCats({bool isFirst = false}) async {
    if (isFirst) {
      _categories = await DatabaseService.instance.getCategoriesWithCount();
      _isLoadingChannels = false;
      setState(() {});
    } else {
      showLoading("Loading cats",context);
      _categories = await DatabaseService.instance.getCategoriesWithCount();
      hideLoading(context);
    }
  }

  void getChannels(int id) async {
    showLoading("Loading Channels",context);
    _channels = await DatabaseService.instance.getChannelsByCategory(id);
    hideLoading(context);
    setState(() {});
  }

  Widget _buildCategories() {
    return ListView.builder(
      itemCount: _categories.length,
      itemBuilder: (_, index) {
        final category = _categories[index];

        return ListTile(
          leading: const Icon(Icons.folder),
          title: Text(category['name'].toUpperCase()),
          subtitle: Text("${category['cn']} channels"),
          trailing: const Icon(Icons.arrow_forward_ios),
          onTap: () {
            _selectedCategory = category;
            getChannels(category['id']);
          },
        );
      },
    );
  }

  Widget _buildChannels() {
    if (_channels.isEmpty) {
      return const Center(child: Text("No Channels Found"));
    }
    return ListView.builder(
      itemCount: _channels.length,
      itemBuilder: (_, index) {
        final ch = _channels[index];
        return buildslisTile1(ch, index);
      },
    );
  }

  Widget _buildChannelsFavs() {
    if (_loadingFavs) {
      return const Center(child:SizedBox(width: 100,height: 100, child: CircularProgressIndicator()));
    }
    if (_favoriteChannels.isEmpty) {
      return const Center(child: Text("No favorite channels"));
    }
    return ListView.builder(
      itemCount: _favoriteChannels.length,
      itemBuilder: (_, index) {
        final ch = _favoriteChannels[index];
        return buildslisTile1(ch, index);
      },
    );
  }


Widget buildslisTile1(dynamic ch, int indexd,) {
 return  buildslisTile(ch:ch,
  setFavourite: () async {
            final newValue = ch['is_fav'] == 1 ? 0 : 1;
            await DatabaseService.instance.setFavourite(
              ch['id'],
              newValue == 1,
            );

            setState(() {
              ch['is_fav'] = newValue;
            });
          },
        dlnaService:  dlnaService,
onClick:  () async {
          selecteChannelIndex = indexd;
          ch['url'] = await resolvePlayableUrl(ch['url'],context);

         // setState(() { });
          if (!dlnaService.isConnected || dlnaService.selectedDevice == null) {
            _showControlsBottomSheetPlayer(ch);

          } else {
            _play(ch);
          }
        },
onLongPress: () => _showQualitySelector(ch, indexd)
       );
}

  Widget _buildSearchResults() {
    if (_searchResults.isEmpty) {
      return const Center(child: Text("No results found"));
    }

    return ListView.builder(
      itemCount: _searchResults.length,
      itemBuilder: (_, index) {
        final ch = _searchResults[index];

        return buildslisTile1(ch, index);
      },
    );
  }



  void _showControlsBottomSheetPlayer(dynamic ch) {
    WakelockPlus.enable();
      final  betterPlayerController = BetterPlayerController(
      BetterPlayerConfiguration(
        aspectRatio: 16 / 10.5,
        autoPlay: true,
        looping: false,
        allowedScreenSleep: false,
        autoDetectFullscreenDeviceOrientation: true,
        autoDetectFullscreenAspectRatio: true,
        placeholderOnTop: false,
        expandToFill: true,handleLifecycle: true,
        fit: BoxFit.fill,autoDispose: true,
        //eventListener: (event) { },
        controlsConfiguration:  BetterPlayerControlsConfiguration(controlBarColor:Colors.black.withAlpha(150),
          enablePlayPause: false,
          enableMute: false,
          enableFullscreen: true,
          enablePip: true,
          enableAudioTracks: true,
          enableProgressBar: true,
          enableOverflowMenu: true,
          enablePlaybackSpeed: false,
          enableRetry: true,
          enableSubtitles: false,
        ),

      ),betterPlayerDataSource:  BetterPlayerDataSource(
    BetterPlayerDataSourceType.network,
    ch['url'],title: ch['name']
  )
    );
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (contextr) {
        return DraggableScrollableSheet(
          initialChildSize: 0.51,
          minChildSize: 0.51,
          maxChildSize: 0.51,
          builder: (_, controller) {  betterPlayerController.addEventsListener((event) async {
                  //print(event.betterPlayerEventType);
                  if (event.betterPlayerEventType ==
                      BetterPlayerEventType.customSkipBack) {
                    final ui = _changeChannel(-1);
                    setState(() {
                      ch = ui;
                      betterPlayerController.setupDataSource(
                        BetterPlayerDataSource(
                          BetterPlayerDataSourceType.network,
                          ui['url'],title: ui['name']
                        ),
                      );
                    });
                  }
                  if (event.betterPlayerEventType ==
                      BetterPlayerEventType.customSkipNext) {
                    final ui = _changeChannel(1);
                    setState(() {
                      ch = ui;
                      betterPlayerController.setupDataSource(
                        BetterPlayerDataSource(
                          BetterPlayerDataSourceType.network,
                          ui['url'],title: ch['name']
                        ),
                      );
                    });
                  }
                  if (event.betterPlayerEventType ==
                      BetterPlayerEventType.customVolume) {
                    VolumeController().setVolume(
                      event.parameters!['volume'] ?? 0.5,
                    );
                  }
                  if (event.betterPlayerEventType ==
                      BetterPlayerEventType.customBrithness) {
                    // print(event.parameters);
                    await ScreenBrightness().setApplicationScreenBrightness(
                      event.parameters!['br'],
                    );
                  }
                });

            return StatefulBuilder(
              builder: (context, setModalState) {
               return Container(
                  decoration: BoxDecoration(
                    color: dlnaService.isDarkMode
                        ? const Color(0xFF1E1E1E)
                        : Colors.white,
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(15),
                    ),
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 20),
                      Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade500,
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),

                      /// Header
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child: Row(
  children: [
    Expanded(
      child: Text(
        ch['name'],
        textAlign: TextAlign.center,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
    ),
    IconButton(
      icon: const Icon(Icons.copy),
      onPressed: () {
        Clipboard.setData(
          ClipboardData(text: ch['url']),
        );
      },
    ),
    IconButton(
      icon: const Icon(Icons.open_in_new),
      onPressed: () async {
        await openM3U(ch['url']);
      },
    ),
    IconButton(
      icon: const Icon(Icons.share),
      onPressed: () async {
        SharePlus.instance.share(
          ShareParams(uri: Uri.parse(ch['url'])),
        );
      },
    ),
    IconButton(
      icon: const Icon(Icons.cast),
      onPressed: () async {
        await dlnaService.discoverAndConnect(context);
      },
    ),
  ],
)
,
                      ),

                      const SizedBox(height: 5),
                      Expanded(
                        child: SingleChildScrollView(
                          controller: controller,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 15),
                            child: Column(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: BetterPlayer(
                                    controller: betterPlayerController,
                                  ),
                                ),

                                const SizedBox(height: 14),

                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceEvenly,
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.skip_previous),
                                      onPressed: () {
                                        if (_channels.isEmpty) return;
                                        final ui = _changeChannel(-1);
                                        setModalState(() {
                                          ch = ui;
                                          betterPlayerController
                                              .setupDataSource(
                                                BetterPlayerDataSource(
                                                  BetterPlayerDataSourceType
                                                      .network,
                                                  ui['url'],title: ui['name']
                                                ),
                                              );
                                        });
                                      },
                                    ),
                                    IconButton(
                                      icon: Icon(
                                        ch['is_fav'] == 1
                                            ? Icons.favorite
                                            : Icons.favorite_border,
                                        color: ch['is_fav'] == 1
                                            ? Colors.red
                                            : null,
                                      ),
                                      onPressed: () async {
                                        final newValue = ch['is_fav'] == 1
                                            ? 0
                                            : 1;
                                        await DatabaseService.instance
                                            .setFavourite(
                                              ch['id'],
                                              newValue == 1,
                                            );

                                        setModalState(() {
                                          ch['is_fav'] = newValue;
                                        });
                                      },
                                    ),
                                    IconButton(
                                      icon: const Icon(
                                        Icons.close,
                                        color: Colors.red,
                                      ),
                                      onPressed: () {
                                        Navigator.pop(context);
                                      },
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.fullscreen),
                                      onPressed: () async {
                                        betterPlayerController
                                            .enterFullScreen();
                                      },
                                    ),

                                    IconButton(
                                      icon: const Icon(Icons.skip_next),
                                      onPressed: () {
                                        final ui = _changeChannel(1);
                                        setModalState(() {
                                          ch = ui;
                                          betterPlayerController
                                              .setupDataSource(
                                                BetterPlayerDataSource(
                                                  BetterPlayerDataSourceType
                                                      .network,
                                                  ui['url'],title: ui['name']
                                                ),
                                              );
                                        });
                                      },
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    ).whenComplete(() {
      betterPlayerController.dispose();
      WakelockPlus.disable();
    });
  }

  // ===============================
  // BUILD
  // ===============================
  @override
  Widget build(BuildContext context) {
    dlnaService.isDarkMode = Theme.of(context).brightness == Brightness.dark;
    return PopScope(
      canPop: (_selectedCategory == null && _searchQuery.isEmpty),
      onPopInvokedWithResult: (didPop, result) {
        if (_selectedCategory != null || _searchQuery.isNotEmpty) {
          setState(() {
            _selectedCategory = null;
            _isSearching = false;
            _searchController.clear();
            _searchQuery = "";
          });
        }
      },
      child: Scaffold(extendBodyBehindAppBar: true,extendBody: true,
        floatingActionButton: FloatingActionButton(
          shape: CircleBorder(),isExtended: true,
          onPressed: () {
            if (!dlnaService.isConnected ||dlnaService.selectedDevice == null) {
              Fluttertoast.showToast(msg: "Connect Tv");
              //_showControlsBottomSheetPlayer(dlnaService.selectedChannel);
            } else {
              _showControlsBottomSheet();
            }
          },
          // backgroundColor: Colors.blue,
          // foregroundColor: Colors.white,
          child: const Icon(Icons.control_camera, size: 36),
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
        bottomNavigationBar: SafeArea(
          child: BottomAppBar(
            height: 60,
            padding: EdgeInsets.all(0),
            shape: const CircularNotchedRectangle(), // encoche pour le FAB
            notchMargin: 6,
            //color:  Colors.blue,
            elevation: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                IconButton(
                  icon: const Icon(Icons.tv, color: Colors.white, size: 36),
                  onPressed: () => _tabController.animateTo(0),
                ),
                dlnaService.isConnected? IconButton(
                  icon: const Icon(
                    Icons.skip_previous,
                    color: Colors.white,
                    size: 36,
                  ),
                  onPressed: () => prevNext(-1),
                ): IconButton(
              icon: const Icon(Icons.cast, color: Colors.white, size: 36),
              onPressed:()async{await dlnaService.discoverAndConnect(context);},
            ),
                const SizedBox(width: 60), // espace pour le FAB
               dlnaService.isConnected?  IconButton(
                  icon: const Icon(
                    Icons.skip_next,
                    color: Colors.white,
                    size: 36,
                  ),
                  onPressed: () => prevNext(1),
                ): IconButton(
              icon: const Icon(Icons.favorite, color: Colors.white, size: 36),
              onPressed: (){_refreshFavorites(); _tabController.animateTo(1);},
            ),
                IconButton(
                  icon: const Icon(
                    Icons.movie_filter_outlined,
                    color: Colors.white,
                    size: 36,
                  ),
                  onPressed: () {
                     Navigator.push(context,MaterialPageRoute(builder: (_) =>MoviesListScreen(  ),),);
                     /*
                    _refreshFavorites();
                    _tabController.animateTo(1);*/
                  },
                ),
              ],
            ),
          ),
        ),
        appBar: AppBar(
          leading: (_selectedCategory != null || _searchQuery.isNotEmpty)
              ? IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () {
                    setState(() {
                      _selectedCategory = null;
                      _searchQuery = "";
                      _isSearching = false;
                      _searchController.text = "";
                    });
                  },
                )
              : null,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _selectedCategory != null
                    ? _selectedCategory!['name'].toUpperCase()
                    : dlnaService.isConnected
                    ? dlnaService.selectedDevice!.name
                    : "DLNA Player",
                style: const TextStyle(fontSize: 16, color: Colors.white),
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: Icon(
                dlnaService.isConnected ? Icons.cast_connected : Icons.cast,
                color: Colors.white,
              ),
              tooltip: dlnaService.isConnected ? "Disconnect" : "Connect",
              onPressed: () async {
                if (dlnaService.isConnected) {
                  Provider.of<DlnaProvider>(
                    context,
                    listen: false,
                  ).disconnect();
                  dlnaService.isConnected = false;
                  // VolumeController.instance.showSystemUI = true;
                  setState(() {});
                } else {
                  await dlnaService.discoverAndConnect(context);
                  setState(() {

                  });
                }
              },
            ),
            IconButton(
              icon: const Icon(Icons.settings, color: Colors.white, size: 36),
              onPressed:()=> _openSettings(context),
            ),
            IconButton(
              icon: _isLoadingChannels
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.refresh, color: Colors.white),
              onPressed:()=>{ _loadChannels()},
            ),
          ],
        ),

        body: SafeArea(
          child: Column(
            children: [
              // 🔍 Search bar
              Padding(
                padding: const EdgeInsets.all(2),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: "Search channels...",
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              setState(() {
                                _searchController.clear();
                                _searchQuery = "";
                                _isSearching = false;
                                _searchResults.clear();
                              });
                              FocusScope.of(context).unfocus();
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onChanged: (value) {
                    _searchQuery = value;
                    _searchFromDb(value);
                  },
                ),
              ),

              // 📺 Tab Views
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    // Channels tab
                    _isSearching
                        ? _buildSearchResults()
                        : _selectedCategory == null
                        ? _buildCategories()
                        : _buildChannels(),

                    // Favorites tab
                    _buildChannelsFavs(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }


  void _play(dynamic ch) async {
    final finalurl = await resolvePlayableUrl(ch['url'],context);
    // print(finalurl.toString());
    await dlnaService.playWithTitle(finalurl, ch['name']);
    dlnaService.setChannel(ch);
    if(autoShowController){
       _showControlsBottomSheet();
    }
    setState(() {

    });

  }
}
