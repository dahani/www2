import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/services.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../models/movie.dart';
import '../services/movie_api_service.dart';
import 'actor_details_screen.dart';
import 'better_movie_player_screen.dart';

class MovieDetailsScreen extends StatefulWidget {
  final int movieId;

  const MovieDetailsScreen({super.key, required this.movieId});

  @override
  State<MovieDetailsScreen> createState() => _MovieDetailsScreenState();
}

class _MovieDetailsScreenState extends State<MovieDetailsScreen> {
  final MovieApiService _api = MovieApiService();
  MovieDetails? _movieDetails;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMovieDetails();
  }

  Future<void> _loadMovieDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final details = await _api.fetchMovieDetails(widget.movieId);
      setState(() {
        _movieDetails = details;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F0F0F),
        body: Center(
          child: SpinKitFadingCircle(color: Color(0xFF1E88E5), size: 60),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0F0F0F),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 60),
              const SizedBox(height: 16),
              Text('Error: $_error', style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadMovieDetails,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E88E5)),
              ),
            ],
          ),
        ),
      );
    }

    if (_movieDetails == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F0F0F),
        body: Center(child: Text('Movie not found', style: TextStyle(color: Colors.white70))),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Stack(
        children: [
          // Backdrop
          if (_movieDetails!.backdrop != null)
            Positioned.fill(
              child: Stack(
                children: [
                  CachedNetworkImage(
                    imageUrl: _movieDetails!.backdrop!,
                    fit: BoxFit.cover,
                    width: double.infinity,
                    height: double.infinity,
                  ),
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withValues(alpha:0.7),
                          const Color(0xFF0F0F0F),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

          // Content
          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Back Button
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 32),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(height: 40),

                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Poster
                      if (_movieDetails!.poster != null)
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: CachedNetworkImage(
                            imageUrl: _movieDetails!.poster!,
                            width: 300,
                            height: 450,
                            fit: BoxFit.cover,
                          ),
                        ),
                      const SizedBox(width: 40),

                      // Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _movieDetails!.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 42,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Meta Info
                            Row(
                              children: [
                                _buildMetaChip(Icons.star, _movieDetails!.rating.toStringAsFixed(1), Colors.amber),
                                const SizedBox(width: 12),
                                _buildMetaChip(Icons.calendar_today, '${_movieDetails!.year}', Colors.grey),
                                if (_movieDetails!.runtime != null) ...[
                                  const SizedBox(width: 12),
                                  _buildMetaChip(Icons.access_time, '${_movieDetails!.runtime}m', Colors.grey),
                                ],
                              ],
                            ),
                            const SizedBox(height: 24),

                            // Genres
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: _movieDetails!.genres.map((genre) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1E88E5).withValues(alpha:0.3),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFF1E88E5)),
                                  ),
                                  child: Text(
                                    genre.displayName,
                                    style: const TextStyle(color: Colors.white, fontSize: 14),
                                  ),
                                );
                              }).toList(),
                            ),
                            const SizedBox(height: 24),



                            // Play Button
                            if (_movieDetails!.videos.isNotEmpty)
                              Focus(
                                autofocus: true,
                                onKeyEvent: (node, event) {
                                  if (event is KeyDownEvent &&
                                      (event.logicalKey == LogicalKeyboardKey.select ||
                                          event.logicalKey == LogicalKeyboardKey.enter)) {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => BetterMoviePlayerScreen(
                                          videos: _movieDetails!.videos,
                                          currentVideoIndex: 0,
                                          movieTitle: _movieDetails!.name,
                                        ),
                                      ),
                                    );
                                    return KeyEventResult.handled;
                                  }
                                  return KeyEventResult.ignored;
                                },
                                child: Builder(
                                  builder: (context) {
                                    final isFocused = Focus.of(context).hasFocus;
                                    return ElevatedButton.icon(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (context) => BetterMoviePlayerScreen(
                                              videos: _movieDetails!.videos,
                                              currentVideoIndex: 0,
                                              movieTitle: _movieDetails!.name,
                                            ),
                                          ),
                                        );
                                      },
                                      icon: const Icon(Icons.play_arrow, size: 32),
                                      label: const Text('Watch Now', style: TextStyle(fontSize: 20)),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF1E88E5),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 20),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        side: isFocused
                                            ? const BorderSide(color: Colors.white, width: 3)
                                            : null,
                                      ),
                                    );
                                  },
                                ),
                              ),
                          const SizedBox(height: 32),
                          // Description
                            if (_movieDetails!.description != null)
                              Text(
                                _movieDetails!.description!,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 16,
                                  height: 1.5,
                                ),
                                maxLines: 6,
                                overflow: TextOverflow.ellipsis,
                              ),


                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 60),

                  // Cast - 5 Column Grid
                  if (_movieDetails!.credits.actors.isNotEmpty) ...[
                    const Text(
                      'Cast',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 24),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 5,
                        childAspectRatio: 0.75,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: _movieDetails!.credits.actors.take(15).length,
                      itemBuilder: (context, index) {
                        final actor = _movieDetails!.credits.actors[index];
                        return _buildActorCard(actor);
                      },
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetaChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha:0.5),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(color: Colors.white, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildActorCard(Person actor) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ActorDetailsScreen(actorId: actor.id),
            ),
          );
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(
        builder: (context) {
          final isFocused = Focus.of(context).hasFocus;

          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ActorDetailsScreen(actorId: actor.id),
                ),
              );
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              transform: Matrix4.identity()..scale(isFocused ? 1.05 : 1.0),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(12),
                border: isFocused
                    ? Border.all(color: const Color(0xFF1E88E5), width: 3)
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: isFocused
                        ? const Color(0xFF1E88E5).withValues(alpha:0.5)
                        : Colors.black.withValues(alpha:0.3),
                    blurRadius: isFocused ? 16 : 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Actor Photo
                    Expanded(
                      child: actor.poster != null && actor.poster!.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: actor.poster!,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (context, url) => Container(
                                color: const Color(0xFF2A2A2A),
                                child: const Icon(Icons.person, color: Colors.grey, size: 40),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: const Color(0xFF2A2A2A),
                                child: const Icon(Icons.person, color: Colors.grey, size: 40),
                              ),
                            )
                          : Container(width: double.infinity,
                              color: const Color(0xFF2A2A2A),
                              child: const Icon(Icons.person, color: Colors.grey, size: 40),
                            ),
                    ),
                    // Actor Info
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      color: const Color(0xFF1A1A1A),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            actor.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (actor.character != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              actor.character!,
                              style: const TextStyle(
                                color: Colors.grey,
                                fontSize: 11,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
