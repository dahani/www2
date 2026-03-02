import 'package:cached_network_image/cached_network_image.dart';
import 'package:dio/dio.dart';
import 'package:dlna/models/models.dart';
import 'package:dlna/screens/ActorDeatils.dart';
import 'package:dlna/screens/PlayerScreen.dart';
import 'package:dlna/services/constant.dart';
import 'package:dlna/services/dio_service.dart';
import 'package:dlna/services/dlnaProvider.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:dlna/services/functions.dart';
import 'package:dlna/widgest/widgets.dart';
import 'package:flutter/material.dart';
import 'dart:ui';

import 'package:provider/provider.dart';
class MovieDetailsScreen extends StatefulWidget {
  final MovieDetails movie;

   const MovieDetailsScreen({super.key, required this.movie});

  @override
  _MovieDetailsScreenState createState() => _MovieDetailsScreenState();
}

class _MovieDetailsScreenState extends State<MovieDetailsScreen> {
  late MovieDetails movie;
    late DlnaService dlnaService;
@override
void initState() {
  super.initState();
     movie=widget.movie;
  dlnaService =  Provider.of<DlnaProvider>(context, listen: false).dlnaService;
}
  @override
  Widget build(BuildContext context) {

    return Scaffold(
      backgroundColor: const Color(0xFF0F1014),
      body: CustomScrollView(
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
                  const SizedBox(height: 30),
                  _buildSectionTitle("Description"),
                  const SizedBox(height: 10),
                  Text(
                    movie.description ?? "No description available.",
                    style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 15, height: 1.5),
                  ),
                  const SizedBox(height: 30),
                  _buildSectionTitle("Top Cast"),
                  const SizedBox(height: 15),
                  _buildCastList(),
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ),
        ],
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
            NetworkImageWidget(imageUrl:  movie.backdrop, fit: BoxFit.cover),
            // Modern Gradient Overlay
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Color(0xFF0F1014),
                  ],
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
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 20),
                        const SizedBox(width: 5),
                        Text(
                          movie.rating.toStringAsFixed(1),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            )
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
          style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
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

  Widget _buildActionButtons() {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () async{
              final VieoIdx=getMovieVideoSrc( movie.embedUrl??"");
              final url="${dlnaService.proxyUrl}?id=$VieoIdx";
              print(url);
              //"$proxyBaseUrl?id=$url"
              if (!dlnaService.isConnected ||dlnaService.selectedDevice == null) {
                     Navigator.push(context,MaterialPageRoute(builder: (_) => PlayerScreen(title:movie.title ,url:url ,isMovie: true, )),);
                  } else {
                   await dlnaService.playWithTitle(url,movie.title );
                  }
            }, // Trigger BetterPlayer logic here
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.redAccent,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 15),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.play_arrow_rounded, size: 28),
            label: const Text("Watch Now", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ),
        const SizedBox(width: 15),
        _circleActionButton(Icons.favorite_border),
        const SizedBox(width: 10),
        _circleActionButton(Icons.download_outlined),
      ],
    );
  }
void _navigateToActor( String personId) async {
   showLoading("Fetching Actor Details", context);
        try {
        final res = await DioService.get(getActorInfos(personId));
          final actorDetails = ActorDetails.fromJson(res.data);
            hideLoading(context);
            Navigator.push(context,
              MaterialPageRoute(builder: (_) => ActorDetailsScreen(actor: actorDetails)),
            );
      } on DioException catch (e) {
        print("Dio error: ${e.message}");
         hideLoading(context);
      } catch (e) {
         hideLoading(context);
        print("Unexpected error: $e");

      }
}
  Widget _buildCastList() {
    return SizedBox(
      height: 160,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: movie.actors.length,
        itemBuilder: (context, index) {
          final actor = movie.actors[index];
          return GestureDetector(
            onTap: ()=>_navigateToActor(actor.id),
            child: Container(
              width: 100,
              margin: const EdgeInsets.only(right: 15),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.grey[800],
                    backgroundImage: actor.poster != null ? CachedNetworkImageProvider(actor.poster!) : null,
                    child: actor.poster == null ? const Icon(Icons.person, color: Colors.white54) : null,
                  ),
                  const SizedBox(height: 10),
                  Text(
                    actor.name,
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                  Text(
                    actor.character,
                    maxLines: 1,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white54, fontSize: 10),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // Helper Widgets
  Widget _infoChip(String text) => Text(text, style: const TextStyle(color: Colors.white54, fontSize: 14));
  Widget _infoDot() => Container(
        margin: const EdgeInsets.symmetric(horizontal: 10),
        width: 4, height: 4,
        decoration: const BoxDecoration(color: Colors.white24, shape: BoxShape.circle),
      );

  Widget _buildSectionTitle(String title) => Text(title, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold));

  Widget _circleActionButton(IconData icon) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white10),
        ),
        child: Icon(icon, color: Colors.white),
      );
}