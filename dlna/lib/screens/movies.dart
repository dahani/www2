import 'dart:convert';
import 'dart:io';

import 'package:dlna/models/models.dart';
import 'package:dlna/screens/movies_favourite.dart';
import 'package:dlna/screens/movie_details.dart';
import 'package:dlna/screens/server_selection_screen.dart';
import 'package:dlna/services/constant.dart';
import 'package:dlna/services/database_service.dart';
import 'package:dlna/services/dio_service.dart';
import 'package:dlna/services/dlna_provider.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:dlna/services/foreground_task_handler.dart';
import 'package:dlna/widgest/controls.dart';
import 'package:dlna/widgest/widgets.dart';
import 'package:flutter/material.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'dart:async';

import 'package:provider/provider.dart';

@pragma('vm:entry-point')
void startCallback() {
  FlutterForegroundTask.setTaskHandler(ProxyTaskHandler());
}

class MoviesListScreen extends StatefulWidget {
  const MoviesListScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _MoviesListScreenState createState() => _MoviesListScreenState();
}

class _MoviesListScreenState extends State<MoviesListScreen> {
  // Pagination State - Now strictly typed to Movie
  final List<Movie> _movies = [];
  List<Movie> _moviesTop10 = [];
  int _page = 1;
  bool _isLoadingMore = false;
  bool _hasMore = true;

  // Search State
  bool _isSearching = false;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;

  late ScrollController _scrollController;
  late Future<List<Movie>> _initialLoadFuture;
  int totalMovies = 0;
  DlnaDevice? selectedDevice;
  late DlnaService dlnaService;

  String selectedGenreId = "1";
  String filters="";
  String order="order=created_at:desc";
  void _initService() {
    debugPrint("_initService");
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'foreground_service',
        channelName: 'Foreground Service Notification',
        channelDescription:
            'This notification appears when the foreground service is running.',
        onlyAlertOnce: true,
      ),
      iosNotificationOptions: const IOSNotificationOptions(
        showNotification: true,
        playSound: false,
      ),
      foregroundTaskOptions: ForegroundTaskOptions(
        eventAction: ForegroundTaskEventAction.repeat(5000),
        autoRunOnBoot: true,
        autoRunOnMyPackageReplaced: true,
        allowWakeLock: true,
        allowWifiLock: true,
      ),
    );
  }

  Future<void> _requestPermissions() async {
    final NotificationPermission notificationPermission =
        await FlutterForegroundTask.checkNotificationPermission();
    if (notificationPermission != NotificationPermission.granted) {
      await FlutterForegroundTask.requestNotificationPermission();
    }

    if (Platform.isAndroid) {
      if (!await FlutterForegroundTask.isIgnoringBatteryOptimizations) {
        // This function requires `android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` permission.
        await FlutterForegroundTask.requestIgnoreBatteryOptimization();
      }
      if (!await FlutterForegroundTask.canScheduleExactAlarms) {
        await FlutterForegroundTask.openAlarmsAndRemindersSettings();
      }
    }
  }

  void _startService() async {
    if (await FlutterForegroundTask.isRunningService) {
      //return ServiceRequestResult()
      //return FlutterForegroundTask.restartService();
      FlutterForegroundTask.sendDataToTask("start_proxy");
    } else {
      FlutterForegroundTask.startService(
        serviceId: 257,
        notificationTitle: 'DLNA Streaming',
        notificationText: 'Keeps connection alive when screen is off.\n ',
        notificationButtons: [
          const NotificationButton(id: 'btn_stop', text: 'Stop Service'),
        ],
        callback: startCallback,
      );
       FlutterForegroundTask.sendDataToTask("start_proxy");
    }
  }

  void _onReceiveTaskData(Object data) {

    if (data is Map<String, dynamic>) {
      final proxy = data['proxy_url'];
      if(proxy!=null) {
        dlnaService.proxyUrl = proxy;
      }
    }
    if (data == "btn_pause") {
      if (dlnaService.isConnected) {
        dlnaService.togglePlayPause();
      }
    }
    debugPrint('onReceiveTaskData: $data');
    //
  }

  @override
  void initState() {
    super.initState();
    dlnaService = Provider.of<DlnaProvider>(context, listen: false).dlnaService;
    _scrollController = ScrollController();
    _scrollController.addListener(_onScroll);
    _initialLoadFuture = _fetchMoviesAPI(_page, _searchQuery);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      // Request permissions and initialize the service.
      _requestPermissions();
      _initService();
      _startService();
      FlutterForegroundTask.addTaskDataCallback(_onReceiveTaskData);

      //
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    _debounce?.cancel();
    super.dispose();
    // FlutterForegroundTask.sendDataToTask("stop_proxy");
  }

  void _openSettings() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return DraggableScrollableSheet(
              initialChildSize: 0.4,
              minChildSize: 0.3,
              maxChildSize: 0.5,
              expand: false,
              builder: (context, scrollController) {
                return Container(

                  decoration: const BoxDecoration(  color: Color(0xFF1E1E1E),
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(30),
                    ),
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: 12),
                      Container(
                        width: 50,
                        height: 5,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      const SizedBox(height: 20),

                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 20),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: Text(
                            "Filters",
                            style: TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,color: Colors.white
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Expanded(
                        child: ListView(
                          controller: scrollController,
                          children: [
                             ListTile(iconColor: Colors.white,textColor: Colors.white,
                              leading: const Icon(Icons.sort),
                              title: const Text("Sort"),
                               onTap:(){
                                  Navigator.pop(context);
                                _showFilterBottomSheet(filterSort,(value) {
                                  final ord="order=$value:desc";
                                  order=order==ord?"order=$value:asc":ord;
                                 _reload();

                                },);
                               },
                            ),
                            ListTile(iconColor: Colors.white,textColor: Colors.white,
                              leading: const Icon(Icons.generating_tokens),
                              title: const Text("Genres"),
                               onTap:(){
                                  Navigator.pop(context);
                                _showFilterBottomSheet(filterGenres,(value) {
                                  _builFilter(value,'[{"key":"genres","value":[$value],"operator":"hasAll"}]');
                                },);
                               },
                            ),
                            ListTile(iconColor: Colors.white,textColor: Colors.white,
                              leading: const Icon(Icons.language),
                              title: const Text("Langues"),
                              onTap:(){
                                  Navigator.pop(context);
                                _showFilterBottomSheet(filterLangues,(value) {
                                  _builFilter(value,'[{"key":"language","value":"$value","operator":"=","valueKey":"$value"}]');
                                },);
                               },
                            ),
                            ListTile(iconColor: Colors.white,textColor: Colors.white,
                              leading: const Icon(Icons.map_rounded),
                              title: const Text("Countries"),
                               onTap:(){
                                  Navigator.pop(context);
                                _showFilterBottomSheet(filterCountries,(value) {
                                  _builFilter(value,'[{"key":"productionCountries","value":[$value],"operator":"hasAll"}]');
                                },);
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

  Widget _buildGenreFilter() {
    return SizedBox(
      height: 45,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        scrollDirection: Axis.horizontal,
        itemCount: filterGenres.length,
        itemBuilder: (context, index) {
          final genre = filterGenres[index];
          final isSelected = selectedGenreId == genre['value'].toString();
          return GestureDetector(
            onTap: () {
              setState(() {
                selectedGenreId = genre['value'].toString();
                final tlx='[{"key":"genres","value":[${genre['value']}],"operator":"hasAll"}]';
                 List<int> bytes = utf8.encode(tlx);
                  String base64String = base64Encode(bytes);
                filters="&filters=$base64String";
                _reload();
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              decoration: BoxDecoration(
                // Red if selected, subtle glass if not
                color: isSelected
                    ? Colors.redAccent
                    : Colors.white.withValues(alpha:  0.05),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: isSelected
                      ? Colors.redAccent
                      : Colors.white.withValues(alpha: 0.1),
                  width: 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: Colors.redAccent.withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : [],
              ),
              child: Center(
                child: Text(
                  genre['name'].toString(),
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontSize: 14,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Future<List<Movie>> _fetchMoviesAPI(int page, String query) async {
    final urlMovies="$baseUrl/channel/Movies?restriction&$order&page=$page&paginate=lengthAware&returnContentOnly=true$filters";
  
    final url = query.isNotEmpty
        ? getSearchQuery(query)
        : urlMovies;
    final res = await DioService.get(url);
    if (query.isNotEmpty) {
    } else {}
    totalMovies = _isSearching
        ? res.data['results'].length
        : res.data['pagination']['total'];
    List<Movie> movies = [];
    final resultData = query.isNotEmpty
        ? res.data['results']
        : res.data['pagination']['data'];
    for (dynamic x in resultData) {
      if (x['model_type'] == "title") {
        movies.add(Movie.fromJson(x));
      }
    }

setState(() {
 totalMovies = _isSearching? movies.length: res.data['pagination']['total'];
});
    return movies;
  }

  // --- DEBOUNCE SEARCH LOGIC ---
  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    _debounce = Timer(const Duration(milliseconds: 800), () {
      if (_searchQuery != query) {
        setState(() {
          _searchQuery = query;
        });
        _reload();
      }
    });
  }

  // --- PAGINATION LOGIC ---
  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 50) {
      if (!_isLoadingMore && _hasMore) {
        _loadMore();
      }
    }
  }

  Future<void> _loadMore() async {
    setState(() {
      _isLoadingMore = true;
      _page++;
    });

    // Strictly typed new movies
    List<Movie> newMovies = await _fetchMoviesAPI(_page, _searchQuery);

    setState(() {
      if (newMovies.isEmpty || (_page * 50) >= totalMovies) {
        _hasMore = false;
      } else {
        _movies.addAll(newMovies);
      }
      _isLoadingMore = false;
    });
  }

  void _reload() {
    setState(() {
      _page = 1;
      _movies.clear();
      _hasMore = true;
      _initialLoadFuture = _fetchMoviesAPI(_page, _searchQuery);
    });
  }

  void _showControlsBottomSheet() {
    if (!dlnaService.isConnected || dlnaService.selectedDevice == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => TVControlBottomSheet(
        isMovie: true,
        onlcik: (command, val) async {
          debugPrint("ccc $command = $val");
          if (command == "prev") {
            dlnaService.seekOneMinute(forward: false, duration: 5);
          } else if (command == "seek_prev") {
            dlnaService.seekOneMinute(forward: false, duration: 10);
          }  else if (command == "next") {
            dlnaService.seekOneMinute(forward: true, duration: 5);
          }  else if (command == "seek_next") {
            dlnaService.seekOneMinute(forward: true, duration: 10);
          } else if (command == "stop") {
            await dlnaService.stop();
          } else if (command == "prevChannel") {
            //_play(dlnaService.lastSelectedChannel);
          }else if (command == "seek") {
            //_play(dlnaService.lastSelectedChannel);
            dlnaService.seekToposition(duration: int.parse(val));
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[900],
      floatingActionButton: FloatingActionButton(backgroundColor: const Color.fromARGB(255, 120, 111, 111),
        onPressed: () =>(!dlnaService.isConnected || dlnaService.selectedDevice == null)?_openSettings(): _showControlsBottomSheet(),shape: CircleBorder(),
        child: Icon((!dlnaService.isConnected || dlnaService.selectedDevice == null)?Icons.sort_by_alpha_outlined:Icons.control_camera),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: SafeArea(
          child: ClipRRect(
    borderRadius: const BorderRadius.vertical(
      top: Radius.circular(15),
    ),
            child: BottomAppBar(color:  Colors.black87,
              height: 55,
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
                    onPressed: () => {Navigator.pop(context)},
                  ),
                   IconButton(
                icon:  Icon(dlnaService.isConnected?Icons.cast_connected: Icons.cast, color: Colors.white, size: 36),
                onPressed:()async{await dlnaService.discoverAndConnect(context);setState(() {

                });},
              ),
                  const SizedBox(width: 60), // espace pour le FAB
                 IconButton(
                icon: const Icon(Icons.favorite, color: Colors.white, size: 36),
                onPressed: (){
                    Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => MoviesFavouriteScreen(),
              ),
            );

                },
              ),
                  IconButton(
                    icon: const Icon(
                      Icons.sort,
                      color: Colors.white,
                      size: 36,
                    ),
                    onPressed: _openSettings,
                  ),
                ],
              ),
            ),
          ),
        ),
      appBar: AppBar(
        backgroundColor: Colors.black87,
        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: false,
                style: const TextStyle(color: Colors.white),
                decoration: const InputDecoration(
                  hintText: 'Search movies...',
                  hintStyle: TextStyle(color: Colors.white54),
                  border: InputBorder.none,
                ),
                onChanged: _onSearchChanged,
              )
            : const Text('Movies'),
        actions: [
          IconButton(
            icon: Icon(_isSearching ? Icons.close : Icons.search),
            onPressed: () {
              setState(() {
                if (_isSearching) {
                  _isSearching = false;
                  _searchController.clear();
                  _searchQuery = '';
                  _reload();
                } else {
                  _isSearching = true;
                }
              });
            },
          ),
          IconButton(icon: const Icon(Icons.refresh), onPressed: _reload),
          IconButton(onPressed:  () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ServerSelectionScreen(),
                                  ),
                                );
                              }, icon: Icon(Icons.link))
        ],
      ),
      // Strongly typed FutureBuilder
      body: SafeArea(
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // 1. Horizontal Top 10 List
            if (!_isSearching)
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Padding(
                      padding: EdgeInsets.fromLTRB(16, 20, 16, 10),
                      child: Text(
                        "Top 10 Trending",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    _buildTop10Section(),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 25, 16, 10),
                      child: Text(
                        "Recently Added ($totalMovies)",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            if (_isSearching)
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 25, 16, 10),
                      child: Text(
                        "Total search ($totalMovies)",
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            if (!_isSearching)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 20),
                  child: _buildGenreFilter(),
                ),
              ),

            FutureBuilder<List<Movie>>(
              future: _initialLoadFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting &&
                    _page == 1) {
                  return const SliverToBoxAdapter(
                    child: Center(
                      child: CircularProgressIndicator(color: Colors.redAccent),
                    ),
                  );
                } else if (snapshot.hasError) {
                  return SliverToBoxAdapter(
                    child: Center(
                      child: Text(
                        'Error: ${snapshot.error}',
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                  );
                }

                // 2. Data logic
                if (_page == 1 && _movies.isEmpty && snapshot.hasData) {
                  _movies.addAll(snapshot.data!);
                }

                if (_movies.isEmpty) {
                  return const SliverToBoxAdapter(
                    child: Center(
                      child: Text(
                        'No movies found.',
                        style: TextStyle(color: Colors.white70, fontSize: 18),
                      ),
                    ),
                  );
                }

                // 3. SUCCESS: Return the SLIVER directly (No SliverToBoxAdapter here!)
                return SliverPadding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 16,
                  ),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.65,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildMovieCard(_movies[index]),
                      childCount: _movies.length,
                    ),
                  ),
                );
              },
            ),

            // 3. Loading Indicator for Pagination
            if (_isLoadingMore)
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 20),
                  child: Center(
                    child: CircularProgressIndicator(color: Colors.redAccent),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  // --- UI: MOVIE CARD ---
  // Now accepts a strongly typed Movie object
  Widget _buildMovieCard(Movie movie) {
    return FutureBuilder<bool>(
      future: DatabaseService.instance.isMovieFav(int.parse(movie.id)),
      builder: (context, snapshot) {
        bool isFav = snapshot.data ?? false;
        return GestureDetector(
          onTap: () {
            Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => MovieDetailsScreen(movieId: movie.id),
            ),
          ).then((value)=>{setState(() {})});
          },
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Dot notation instead of bracket notation
                NetworkImageWidget(imageUrl: movie.image, fit: BoxFit.cover),
                Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black54, Colors.black],
                      stops: [0.4, 0.7, 1.0],
                    ),
                  ),
                ),
                 Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                        color: Colors.black54, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        Text(movie.rating.toString(),
                            style: const TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 8,
                  left: 8,
                  right: 8,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Center(
                        child: Text(
                          movie.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon:  Icon(
                              isFav?  Icons.favorite:Icons.favorite_border,
                              color: Colors.white,
                              size: 24,
                            ),
                            onPressed: ()async {
                              await DatabaseService.instance.toggleMovieFavourite(movie);
                               setState(() {});
                            },
                          ),
                          Text(
                            movie.duration,
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 11,
                            ),
                          ),
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon: const Icon(
                              Icons.info_outline,
                              color: Colors.white,
                              size: 24,
                            ),
                            onPressed: () => _showInfoBottomSheet(movie),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildHorizontalTop10(List<Movie> topTen) {
    return SizedBox(
      height: 240, // Adjusted for 16:9 ratio + padding
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: topTen.length,
        itemBuilder: (context, index) {
          final movie = topTen[index];
          return GestureDetector(
            onTap: (){
              Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => MovieDetailsScreen(movieId: movie.id),
              ),
            ).then((value)=>{
                setState(() {  })
            });
            },
            child: Container(
              width: 300, // Wide format width
              margin: const EdgeInsets.only(right: 16),
              child: Stack(
                children: [
                  // 1. The Backdrop Image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: NetworkImageWidget(
                      imageUrl:
                          movie.backdrop, // Using backdrop instead of poster
                      width: 300,
                      height: 220,
                      fit: BoxFit.cover,
                    ),
                  ),

                  // 2. Gradient Overlay for legibility
                  Container(
                    height: 220,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(15),
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withValues(alpha: 0.1),
                          Colors.black.withValues(alpha: 0.8),
                        ],
                      ),
                    ),
                  ),

                  // 3. Rank Badge (Modern Circular Style)
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withValues(alpha: 0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Text(
                        "#${index + 1}",
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),

                  // 4. Movie Title & Info Overlay
                  Positioned(
                    bottom: 30,
                    left: 15,
                    right: 15,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          movie.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            shadows: [
                              Shadow(blurRadius: 8, color: Colors.black),
                            ],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(
                              Icons.star,
                              color: Colors.amber,
                              size: 14,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              "${movie.rating} / 10",
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTop10Section() {
    if (_moviesTop10.isNotEmpty) {
      return _buildHorizontalTop10(_moviesTop10);
    }
    return FutureBuilder<List<Movie>>(
      future: _getTop10(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return const Center(child: Text('Failed to load Top 10'));
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return const SizedBox();
        }
        _moviesTop10 = snapshot.data!;
        return _buildHorizontalTop10(snapshot.data!);
      },
    );
  }

  Future<List<Movie>> _getTop10() async {
    final res = await DioService.get(egyBestTopTen());
    List<Movie> movies = [];
    final resultData = res.data['channel']['content']['data'];
    for (dynamic x in resultData) {
      movies.add(Movie.fromJson(x));
    }
    return movies;
  }
 void _showFilterBottomSheet(dynamic data,Function(String value) voidCallback ) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 1,
        builder: (_, controller) {
          return SafeArea(
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFF1E1E1E),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  const SizedBox(height: 16),
                  const Text(
                    "Genres",
                    style: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  const SizedBox(height: 16),

                  // Liste horizontale propre
                  Expanded(
              child: ListView.builder(
                controller: controller, // ← OBLIGATOIRE
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: data.length,
                itemBuilder: (context, index) {
                  final genre = data[index];
                  final isSelected =
            selectedGenreId == genre['value'].toString();

                  return ListTile(
                    title: Text(textAlign:TextAlign.right,
            genre['name'].toString(),
            style: TextStyle(
              color: isSelected ? Colors.blue : Colors.white,
            ),
                    ),
                    onTap: () {
             Navigator.pop(context);
            voidCallback(genre['value'].toString());
                    },
                  );
                },
              ),
            ),

                ],
              ),
            ),
          );
        },
      );
    },
  );
}


  void _showInfoBottomSheet(Movie movie) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.7,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          builder: (_, controller) {
            return Container(
              decoration: const BoxDecoration(
                color: Color(0xFF1E1E1E),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: SingleChildScrollView(
                controller: controller,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(24),
                      ),
                      child: NetworkImageWidget(
                        imageUrl: movie.image,
                        width: double.infinity,
                        height: 390,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            movie.title,
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(
                                Icons.access_time,
                                color: Colors.grey,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                movie.duration,
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                          const Divider(color: Colors.white24),
                          const SizedBox(height: 12),
                          const Text(
                            'Synopsis',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Directionality(textDirection: TextDirection.rtl,
                            child: Text(
                              movie.description,
                              style: const TextStyle(
                                fontSize: 15,
                                height: 1.5,
                                color: Colors.white70,
                              ),
                            ),
                          ),
                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _builFilter(String value,String filter) {
      List<int> bytes = utf8.encode(filter);
        String base64String = base64Encode(bytes);
      filters="&filters=$base64String";
      _reload();
  }
}
