import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/services.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../models/actor.dart';
import '../services/movie_api_service.dart';
import 'movie_details_screen.dart';

class ActorDetailsScreen extends StatefulWidget {
  final int actorId;

  const ActorDetailsScreen({super.key, required this.actorId});

  @override
  State<ActorDetailsScreen> createState() => _ActorDetailsScreenState();
}

class _ActorDetailsScreenState extends State<ActorDetailsScreen> {
  final MovieApiService _api = MovieApiService();
  ActorDetails? _actorDetails;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadActorDetails();
  }

  Future<void> _loadActorDetails() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final details = await _api.fetchActorDetails(widget.actorId);
      setState(() {
        _actorDetails = details;
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
                onPressed: _loadActorDetails,
                icon: const Icon(Icons.refresh),
                label: const Text('Retry'),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1E88E5)),
              ),
            ],
          ),
        ),
      );
    }

    if (_actorDetails == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F0F0F),
        body: Center(child: Text('Actor not found', style: TextStyle(color: Colors.white70))),
      );
    }

    final actor = _actorDetails!.person;
    final allMovies = _actorDetails!.credits.allMovies;

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with Actor Info
            Container(
              padding: const EdgeInsets.all(40),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF1E88E5).withValues(alpha:0.3),
                    const Color(0xFF0F0F0F),
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Back Button
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 32),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(height: 20),

                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Actor Photo
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: actor.poster != null
                            ? CachedNetworkImage(
                                imageUrl: actor.poster!,
                                width: 250,
                                height: 375,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(
                                  width: 250,
                                  height: 375,
                                  color: const Color(0xFF2A2A2A),
                                  child: const Icon(Icons.person, size: 80, color: Colors.grey),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  width: 250,
                                  height: 375,
                                  color: const Color(0xFF2A2A2A),
                                  child: const Icon(Icons.person, size: 80, color: Colors.grey),
                                ),
                              )
                            : Container(
                                width: 250,
                                height: 375,
                                color: const Color(0xFF2A2A2A),
                                child: const Icon(Icons.person, size: 80, color: Colors.grey),
                              ),
                      ),
                      const SizedBox(width: 40),

                      // Actor Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              actor.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 48,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Known For
                            if (actor.knownFor != null)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E88E5).withValues(alpha:0.3),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: const Color(0xFF1E88E5)),
                                ),
                                child: Text(
                                  actor.knownFor!,
                                  style: const TextStyle(color: Colors.white, fontSize: 14),
                                ),
                              ),
                            const SizedBox(height: 24),

                            // Personal Info
                            if (actor.birthDate != null || actor.birthPlace != null) ...[
                              _buildInfoRow(Icons.cake, 'Born', actor.birthDate ?? 'Unknown'),
                              if (actor.birthPlace != null)
                                _buildInfoRow(Icons.location_on, 'Birth Place', actor.birthPlace!),
                            ],

                            if (actor.deathDate != null)
                              _buildInfoRow(Icons.event, 'Died', actor.deathDate!),

                            _buildInfoRow(Icons.trending_up, 'Popularity', actor.popularity.toStringAsFixed(1)),

                            if (actor.description != null && actor.description!.isNotEmpty) ...[
                              const SizedBox(height: 24),
                              const Text(
                                'Biography',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                actor.description!,
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 16,
                                  height: 1.5,
                                ),
                                maxLines: 6,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Filmography Section
            Padding(
              padding: const EdgeInsets.all(40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Filmography',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E88E5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_actorDetails!.totalCreditsCount} titles',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Movies Grid
                  if (allMovies.isEmpty)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: Text(
                          'No movies found',
                          style: TextStyle(color: Colors.white70, fontSize: 18),
                        ),
                      ),
                    )
                  else
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 6,
                        childAspectRatio: 0.7,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                      ),
                      itemCount: allMovies.length,
                      itemBuilder: (context, index) {
                        final movie = allMovies[index];
                        return _buildMovieCard(movie);
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF1E88E5), size: 20),
          const SizedBox(width: 12),
          Text(
            '$label: ',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
          Flexible(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMovieCard(ActorMovie movie) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => MovieDetailsScreen(movieId: movie.id),
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
                  builder: (context) => MovieDetailsScreen(movieId: movie.id),
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
                    // Movie Poster
                    Expanded(
                      child: movie.poster != null && movie.poster!.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: movie.poster!,
                              fit: BoxFit.cover,
                              width: double.infinity,
                              placeholder: (context, url) => Container(
                                color: const Color(0xFF2A2A2A),
                                child: const Icon(Icons.movie, color: Colors.grey, size: 30),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: const Color(0xFF2A2A2A),
                                child: const Icon(Icons.movie, color: Colors.grey, size: 30),
                              ),
                            )
                          : Container(
                              color: const Color(0xFF2A2A2A),
                              child: const Icon(Icons.movie, color: Colors.grey, size: 30),
                            ),
                    ),
                    // Movie Info
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            movie.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (movie.character != null || movie.job != null) ...[
                            const SizedBox(height: 4),
                            Text(
                              movie.character ?? movie.job ?? '',
                              style: const TextStyle(
                                color: Colors.grey,
                                fontSize: 10,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.star, color: Colors.amber, size: 12),
                              const SizedBox(width: 4),
                              Text(
                                movie.rating.toStringAsFixed(1),
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
                                ),
                              ),
                              const Spacer(),
                              Text(
                                '${movie.year}',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 11,
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
            ),
          );
        },
      ),
    );
  }
}
