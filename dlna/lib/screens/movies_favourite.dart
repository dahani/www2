import 'package:dlna/models/models.dart';
import 'package:dlna/screens/movie_details.dart';
import 'package:flutter/material.dart';
import 'package:dlna/services/database_service.dart'; // Adjust path
import 'package:dlna/widgest/widgets.dart';

class MoviesFavouriteScreen extends StatefulWidget {
  const MoviesFavouriteScreen({super.key});

  @override
  MoviesFavouriteScreenState createState() => MoviesFavouriteScreenState();
}

class MoviesFavouriteScreenState extends State<MoviesFavouriteScreen> {
  List<Movie> _favMovies = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadFavourites();
  }

  Future<void> _loadFavourites() async {
    final data = await DatabaseService.instance.getFavouriteMovies();
    setState(() {
      _favMovies = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1014),
      appBar: AppBar(
        title: const Text("My Movie List", style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF0F1014),
        elevation: 0,
      ),
      body: SafeArea(
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Colors.redAccent))
            : _favMovies.isEmpty
                ? _buildEmptyState()
                : GridView.builder(
                    padding: const EdgeInsets.all(15),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.7,
                      crossAxisSpacing: 15,
                      mainAxisSpacing: 15,
                    ),
                    itemCount: _favMovies.length,
                    itemBuilder: (context, index) {
                      final movieData = _favMovies[index];
                      return _buildMovieItem(movieData);
                    },
                  ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.movie_outlined, size: 80, color: Colors.white.withValues(alpha:  0.2)),
          const SizedBox(height: 15),
          const Text("No favourite movies yet",
              style: TextStyle(color: Colors.white54, fontSize: 18)),
        ],
      ),
    );
  }

  Widget _buildMovieItem(Movie data) {

    return GestureDetector(
      onTap: () async {
        // Convert Map back to MovieDetails object
        //final movie = Movie.fromJson(data);
        await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => MovieDetailsScreen(movieId: data.id.toString())),
        );
        _loadFavourites(); // Refresh list when coming back
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: NetworkImageWidget(
                    imageUrl: data.image,
                    fit: BoxFit.cover,
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                        color: Colors.black54, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        Text(" ${data.rating}",
                            style: const TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
                 Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                        color: Colors.black54, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(Icons.timer_sharp, color: Colors.amber, size: 14),
                        Text(" ${data.duration}",style: const TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),
                )
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            data.title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}