
// ignore_for_file: use_build_context_synchronously

import 'package:dio/dio.dart';
import 'package:dlna/models/models.dart';
import 'package:dlna/screens/actor_deatils.dart';
import 'package:dlna/screens/player_screen.dart';
import 'package:dlna/screens/fullcast.dart';
import 'package:dlna/services/constant.dart';
import 'package:dlna/services/database_service.dart';
import 'package:dlna/services/dio_service.dart';
import 'package:dlna/services/dlna_provider.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:dlna/services/functions.dart';
import 'package:dlna/widgest/widgets.dart';
import 'package:flutter/material.dart';
import 'dart:ui';

import 'package:provider/provider.dart';

class MovieDetailsScreen extends StatefulWidget {
  final String movieId;

  const MovieDetailsScreen({
    super.key,
    required this.movieId,
  });

  @override
  MovieDetailsScreenState createState() => MovieDetailsScreenState();
}

class MovieDetailsScreenState extends State<MovieDetailsScreen> {
  late MovieDetails movie;
  late DlnaService dlnaService;
  List<String> imagesMovie=[];
  final List<Movie> related_movies = [];
  dynamic credits;
   bool isFav = false;
   bool loadedInfos=false;
  @override
  void initState() {
    super.initState();
    dlnaService = Provider.of<DlnaProvider>(context, listen: false).dlnaService;

checkFavStatus();
_getRelatedMovies();
  }

  Future<dynamic> _getRelatedMovies() async {
    final res = await DioService.get(getRelatedMovies(widget.movieId));

    final rel= res.data['titles'].map((row) => Movie.fromJson(row)).toList();
    for (dynamic x in rel) {print(x);
      related_movies.add(x);
    }
     print(related_movies);

  }
  Future<dynamic> _getMovieInfos() async {
    final res = await DioService.get(getMovieInfos(widget.movieId));
    return res.data;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton(onPressed:()async{if(!dlnaService.isConnected){await dlnaService.discoverAndConnect(context);}},
      child: Icon(dlnaService.isConnected? Icons.cast_connected:Icons.cast),),
      backgroundColor: const Color(0xFF0F1014),
      body: loadedInfos? _buildBody(): FutureBuilder<dynamic>(
        future: _getMovieInfos(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(color: Colors.redAccent),
            );
          } else if (snapshot.hasError) {
            return Center(
              child: Text(
                'Error: ${snapshot.error}',
                style: const TextStyle(color: Colors.white),
              ),
            );
          } else {
            movie = MovieDetails.fromJson(snapshot.data);
             imagesMovie = List<String>.from(snapshot.data['title']['images'].map((e) => e['url']),);
             credits=snapshot.data['credits'];
             loadedInfos=true;
            return  _buildBody();
             }
        },
      ),
    );
  }
Widget _buildBody(){
  return CustomScrollView(
              slivers: [
                _buildAppBar(context),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildMainInfo(),
                        const SizedBox(height: 25),
                        _buildActionButtons(),
                        if(imagesMovie.isNotEmpty)
                        FullWidthGallery(images:imagesMovie),
                        const SizedBox(height: 30),
                        _buildSectionTitle("Description"),
                        const SizedBox(height: 10),

                        Directionality(textDirection: TextDirection.rtl,
                          child: Text(
                            movie.description ?? "No description available.",
                            style: TextStyle(
                              color: Colors.white.withValues(alpha:  0.7),
                              fontSize: 15,
                              height: 1.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 30),
                          const SizedBox(height: 30),
                         if(related_movies.isNotEmpty)
                         _buildSectionTitle("Related Movies"),
                           if(related_movies.isNotEmpty)
                         SizedBox(
                          height: 260,
                        child: GridView.builder(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 1,//mainAxisExtent: 200,
                            childAspectRatio: 1.6,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: related_movies.length,
                          itemBuilder: (context, index) {
                            final movie = related_movies[index];
                            return buildMovieCard(
                              movie,
                              () async {
                                await DatabaseService.instance.toggleMovieFavourite(movie);
                                setState(() {});
                              },
                              context,
                            );
                          },
                        ),
                      ),

                        Row(
                          children: [
                            Text(
                              "Top Cast",
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Spacer(),
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => FullCastScreen(
                                      data: credits,
                                      movieTitle: movie.title,
                                    ),
                                  ),
                                );
                              },
                              child: const Text(
                                'More',
                                style: TextStyle(
                                  color: Colors.redAccent,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 15),
                      ],
                    ),
                  ),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverGrid(
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3,childAspectRatio: 0.75,mainAxisSpacing: 0,crossAxisSpacing: 0,
                        ),
                    delegate: SliverChildBuilderDelegate((context, index) {
                      final actor = movie.actors[index];
                      return GestureDetector(
                        onTap: () => _navigateToActor(actor.id),
                        child:actorCard(actor) );

                    }, childCount: movie.actors.length),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Column(
                    children: [
                      _buildSectionTitle("Production Information"),
                      _buildDetailRow("Language", movie.language.toUpperCase()),
                      const SizedBox(height: 50),
                    ],
                  ),
                ),
              ],
            );

}
  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: RichText(
        text: TextSpan(
          children: [
            TextSpan(
              text: "$label: ",
              style: const TextStyle(
                color: Colors.grey,
                fontWeight: FontWeight.bold,
              ),
            ),
            TextSpan(
              text: value,
              style: const TextStyle(color: Colors.white70),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      expandedHeight: 400,
      backgroundColor: const Color(0xFF0F1014),
      elevation: 0,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            NetworkImageWidget(imageUrl: movie.backdrop, fit: BoxFit.cover),
            // Modern Gradient Overlay
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xFF0F1014)],
                ),
              ),
            ),
            // Rating Badge (Floating)
            Positioned(
              bottom: 20,
              right: 20,
              child: ClipRRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha:  0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withValues(alpha:  0.2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 20),
                        const SizedBox(width: 5),
                        Text(
                          movie.rating.toStringAsFixed(1),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMainInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          movie.title,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            _infoChip("${movie.year}"),
            _infoDot(),
            _infoChip("${(movie.runtime)} min"),
            _infoDot(),
            _infoChip(movie.genres.isNotEmpty ? movie.genres.first : "Movie"),
          ],
        ),
      ],
    );
  }

void checkFavStatus() async {
  bool status = await DatabaseService.instance.isMovieFav(int.parse(widget.movieId));
  setState(() => isFav = status);
}
  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () async {
              final vieoIdx = getVideoId(movie.embedUrl ?? "");
              final url = "${dlnaService.proxyUrl}?id=$vieoIdx";

              //"$proxyBaseUrl?id=$url"
              if (!dlnaService.isConnected ||
                  dlnaService.selectedDevice == null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => PlayerScreen(
                      title: movie.title,
                      url: url,
                      isMovie: true,
                    ),
                  ),
                );
              } else {
                dlnaService.videoDuration=movie.duration;
                await dlnaService.playWithTitle(url, movie.title,isMovie: true);
              }
            }, // Trigger BetterPlayer logic here
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 15),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.play_arrow_rounded, size: 28),
            label: const Text(
              "Watch Now",
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(width: 15),
        GestureDetector(child: _circleActionButton(isFav?Icons.favorite: Icons.favorite_border),onTap: () async {
  await DatabaseService.instance.toggleMovieFavourite(Movie.fromMovieDetails(movie));
  setState(() => isFav = !isFav);
},),
        const SizedBox(width: 10),
        _circleActionButton(Icons.download_outlined),
      ],
    );
  }

  void _navigateToActor(String personId) async {
    showLoading("Fetching Actor Details", context);
    try {
      final res = await DioService.get(getActorInfos(personId));
      final actorDetails = ActorDetails.fromJson(res.data);
      hideLoading(context);
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => ActorDetailsScreen(actor: actorDetails),
        ),
      );
    } on DioException catch (e) {
      debugPrint("Dio error: ${e.message}");
      hideLoading(context);
    } catch (e) {
      hideLoading(context);
      debugPrint("Unexpected error: $e");
    }
  }

  // Helper Widgets
  Widget _infoChip(String text) =>
      Text(text, style: const TextStyle(color: Colors.white54, fontSize: 14));
  Widget _infoDot() => Container(
    margin: const EdgeInsets.symmetric(horizontal: 10),
    width: 4,
    height: 4,
    decoration: const BoxDecoration(
      color: Colors.white24,
      shape: BoxShape.circle,
    ),
  );

  Widget _buildSectionTitle(String title) => Text(
    title,
    style: const TextStyle(
      color: Colors.white,
      fontSize: 20,
      fontWeight: FontWeight.bold,
    ),
  );

  Widget _circleActionButton(IconData icon) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha:  0.05),
      shape: BoxShape.circle,
      border: Border.all(color: Colors.white10),
    ),
    child: Icon(icon, color: Colors.white),
  );
}
