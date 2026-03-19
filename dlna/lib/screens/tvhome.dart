import 'dart:async';
import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:dlna/screens/movies.dart';
import 'package:dlna/services/constant.dart';
import 'package:dlna/services/functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:provider/provider.dart';
import 'package:better_player_plus/better_player_plus.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

// Tes imports existants
import 'package:dlna/models/models.dart';
import 'package:dlna/services/database_service.dart';
import 'package:dlna/services/dlna_provider.dart';
import 'package:dlna/services/dlna_service.dart';

class DlnaTvHomePage extends StatefulWidget {
  const DlnaTvHomePage({super.key});

  @override
  State<DlnaTvHomePage> createState() => _DlnaTvHomePageState();
}

class _DlnaTvHomePageState extends State<DlnaTvHomePage> {
  late DlnaService dlnaService;
  List<ChannelModel> _displayChannels = [];
  List<Map<String, dynamic>> _categories = [];
  bool _isLoading = true;
  int _selectedCategoryIndex = 0;

  @override
  void initState() {
    super.initState();
    dlnaService = Provider.of<DlnaProvider>(context, listen: false).dlnaService;
    _initData();
  }

Future<void> _initData() async {
  try {
    setState(() => _isLoading = true);

    // 1. Vérifier si on a déjà des catégories en base de données
    _categories = await DatabaseService.instance.getCategoriesWithCount();

    // 2. Si la base est vide (Premier lancement)
    if (_categories.isEmpty) {
      print("Premier lancement détecté : Chargement depuis le serveur...");
      await _loadChannels();
      _categories = await DatabaseService.instance.getCategoriesWithCount();
    }

    // 3. Charger les chaînes de la première catégorie si disponible
    if (_categories.isNotEmpty) {
      // On s'assure que l'index ne dépasse pas
      _selectedCategoryIndex = 0;
      final categoryId = _categories[_selectedCategoryIndex]['id'];

      final results = await DatabaseService.instance.getChannelsByCategory(categoryId);

      setState(() {
        _displayChannels = results.map((e) => ChannelModel.fromMap(e)).toList();
      });
    }
  } catch (e) {
    Fluttertoast.showToast(msg: "Erreur de connexion au serveur");
  } finally {
    setState(() => _isLoading = false);
  }
}

// Ta fonction de chargement adaptée pour la TV
Future<void> _loadChannels() async {
  try {
    // Utilisation de Dio pour récupérer ton JSON
    final resp = await Dio().get(JSON_URL);

    if (resp.statusCode == 200) {
      // Conversion et insertion
      final List data = jsonDecode(resp.data.toString());
      await DatabaseService.instance.insertFullJson(data);

      Fluttertoast.showToast(
        msg: "Mise à jour terminée",
        gravity: ToastGravity.CENTER, // Plus visible sur TV
        backgroundColor: Colors.green,
      );
    }
  } catch (e) {
    print("Erreur Dio : $e");
    rethrow; // On renvoie l'erreur pour qu'elle soit gérée par _initData
  }
}
  Future<void> _loadCategoryChannels(int categoryId) async {
    setState(() => _isLoading = true);
    final results = await DatabaseService.instance.getChannelsByCategory(categoryId);
    setState(() {
      _displayChannels = results.map((e) => ChannelModel.fromMap(e)).toList();
      _isLoading = false;
    });
  }

  void _playM3u8(ChannelModel ch) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => TvPlayerScreen(channel: ch)),
    );
  }
 @override
  Widget build(BuildContext context) {
    if (_isLoading && _categories.isEmpty) {
    return const Scaffold(
      backgroundColor: Color(0xFF0A0A0A),
      body: Center(
        child: CircularProgressIndicator(color: Colors.blueAccent),
      ),
    );
  }
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      body: Row(
        children: [
          NavigationRail(scrollable: true,
            backgroundColor: Colors.black,
            unselectedLabelTextStyle: const TextStyle(color: Colors.white54),
            selectedLabelTextStyle: const TextStyle(color: Colors.blue, fontWeight: FontWeight.bold),
            unselectedIconTheme: const IconThemeData(color: Colors.white54),
            selectedIconTheme: const IconThemeData(color: Colors.blue),
            useIndicator: true,
            indicatorColor: Colors.blue.withAlpha(50),
            labelType: NavigationRailLabelType.all,
            destinations: _categories.map((cat) {
              return NavigationRailDestination(
                icon: const Icon(Icons.folder),
                label: Text(
                  cat['name'].toString().toUpperCase(),
                  style: const TextStyle(fontSize: 10),
                ),
              );
            }).toList(),
            selectedIndex: _selectedCategoryIndex,
            onDestinationSelected: (index) {
              setState(() => _selectedCategoryIndex = index);
              _loadCategoryChannels(_categories[index]['id']);
            },
          ),

          const VerticalDivider(thickness: 1, width: 1, color: Colors.white10),

          // --- MAIN CONTENT ---
          Expanded(
            child: Column(
              children: [
                // Mini App Bar Custom
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.black,
                  child: Row(
                    children: [
                      Text(
                        _categories.isNotEmpty ? _categories[_selectedCategoryIndex]['name'].toUpperCase() : "TV",
                        style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const Spacer(),
                      _TvHeaderIconButton(
                        icon: Icons.favorite,
                        onPressed: () async {
                          setState(() => _isLoading = true);
                          final favs = await DatabaseService.instance.getFavourites();
                          setState(() {
                            _displayChannels = favs.map((e) => ChannelModel.fromMap(e)).toList();
                            _isLoading = false;
                          });
                        }
                      ),
                      _TvHeaderIconButton(icon: Icons.sync, onPressed: ()async {
                         setState(() => _isLoading = true);
                         await _loadChannels();
                          setState(() => _isLoading = false);
                      },),
                       _TvHeaderIconButton(icon: Icons.movie, onPressed: () {
                          Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => MoviesListScreen()),
                      );
                       },),
                    ],
                  ),
                ),

                // Grid des chaînes
                Expanded(
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator())
                      : GridView.builder(
                          padding: const EdgeInsets.all(20),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 4,
                            mainAxisSpacing: 20,
                            crossAxisSpacing: 20,
                            childAspectRatio: 1.3,
                          ),
                          itemCount: _displayChannels.length,
                          itemBuilder: (context, index) {
                            return _TvChannelCard(
                              channel: _displayChannels[index],
                              onTap: () => _playM3u8(_displayChannels[index]),
                              onToggleFavorite: (updatedChannel) {
                                setState(() {
                                  // Met à jour localement l'état pour changer l'icône immédiatement
                                  _displayChannels[index].isFav = (updatedChannel.isFav == 1) ? 0 : 1;
                                });
                              },
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// --- BOUTON ICONE TV ---
class _TvHeaderIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  const _TvHeaderIconButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Focus(
      child: Builder(builder: (context) {
        final bool hasFocus = Focus.of(context).hasFocus;
        return IconButton(
          icon: Icon(icon, color: hasFocus ? Colors.blue : Colors.white),
          onPressed: onPressed,
        );
      }),
    );
  }
}

// --- CARTE CHAINE TV ---


class _TvChannelCard extends StatefulWidget {
  final ChannelModel channel;
  final VoidCallback onTap;
  final Function(ChannelModel) onToggleFavorite; // Callback pour informer le parent

  const _TvChannelCard({
    required this.channel,
    required this.onTap,
    required this.onToggleFavorite,
  });

  @override
  State<_TvChannelCard> createState() => _TvChannelCardState();
}

class _TvChannelCardState extends State<_TvChannelCard> {
  bool _isFocused = false;
  Timer? _longPressTimer;

  // Fonction pour basculer le statut favori
  void _handleFavorite() async {
    final int newStatus = widget.channel.isFav == 1 ? 0 : 1;

    // Mise à jour en base de données
    await DatabaseService.instance.setFavourite(widget.channel.id, newStatus==1);

    // Notification du changement (pour rafraîchir l'UI)
    widget.onToggleFavorite(widget.channel);

    Fluttertoast.showToast(
      msg: newStatus == 1 ? "Ajouté aux favoris ❤️" : "Retiré des favoris",
      gravity: ToastGravity.BOTTOM,
      backgroundColor: Colors.blueAccent,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (f) => setState(() => _isFocused = f),
      onKeyEvent: (node, event) {
        // Détection du bouton "Select" (Centre du D-pad)
        if (event.logicalKey == LogicalKeyboardKey.select ||
            event.logicalKey == LogicalKeyboardKey.enter) {

          if (event is KeyDownEvent) {
            // Démarrer un timer pour l'appui long (800ms)
            _longPressTimer = Timer(const Duration(milliseconds: 800), () {
              _handleFavorite();
              _longPressTimer = null;
            });
          } else if (event is KeyUpEvent) {
            // Si on relâche avant 800ms, c'est un clic simple (Play)
            if (_longPressTimer != null) {
              _longPressTimer!.cancel();
              widget.onTap();
            }
          }
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: GestureDetector(
        onTap: widget.onTap,
        onLongPress: _handleFavorite, // Support aussi pour le tactile/souris
        child: AnimatedScale(
          scale: _isFocused ? 1.1 : 1.0,
          duration: const Duration(milliseconds: 150),
          child: Container(
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              color: Colors.grey[900],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _isFocused ? Colors.blueAccent : Colors.white10,
                width: 3,
              ),
            ),
            child: Stack(
              fit: StackFit.expand,
              children: [
                CachedNetworkImage(
                  imageUrl: widget.channel.poster,
                  fit: BoxFit.cover,
                  placeholder: (context, url) => Container(color: Colors.white10),
                  errorWidget: (context, url, error) => const Icon(Icons.tv),
                ),

                // Overlay dégradé
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                      stops: const [0.6, 1.0],
                    ),
                  ),
                ),

                // Nom de la chaîne
                Positioned(
                  bottom: 8,
                  left: 8,
                  right: 8,
                  child: Text(
                    widget.channel.name,
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ),

                // ÉTOILE FAVORIS (Si isFav == 1)
                if (widget.channel.isFav == 1)
                  const Positioned(
                    top: 8,
                    left: 8,
                    child: Icon(Icons.favorite, color: Colors.red, size: 20),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
// --- PLAYER TV M3U8 ---
class TvPlayerScreen extends StatefulWidget {
  final ChannelModel channel;
  const TvPlayerScreen({super.key, required this.channel});

  @override
  State<TvPlayerScreen> createState() => _TvPlayerScreenState();
}

class _TvPlayerScreenState extends State<TvPlayerScreen> {
  late BetterPlayerController _controller;

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    _controller = BetterPlayerController(
      const BetterPlayerConfiguration(
        autoPlay: true,
        fit: BoxFit.contain,
        fullScreenByDefault: true,
      ),
      betterPlayerDataSource: BetterPlayerDataSource(
        BetterPlayerDataSourceType.network,
        widget.channel.url,
        liveStream: true,
      ),
    );
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(backgroundColor: Colors.black, body: BetterPlayer(controller: _controller));
  }
}