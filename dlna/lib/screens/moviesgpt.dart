import 'dart:async';
import 'package:dlna/models/models.dart';
import 'package:flutter/material.dart';

class MoviesListScreenGpt extends StatefulWidget {
  const MoviesListScreenGpt({super.key});

  @override
  State<MoviesListScreenGpt> createState() => _MoviesListScreenGptState();
}

class _MoviesListScreenGptState extends State<MoviesListScreenGpt> {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();

  List<Movie> _movies = [];
  bool _isLoadingMore = false;
  int _page = 1;
  String _searchQuery = "";

  late Future<List<Movie>> _future;

  @override
  void initState() {
    super.initState();
    _future = fetchMovies(page: _page);

    _scrollController.addListener(() {
      if (_scrollController.position.pixels >=
              _scrollController.position.maxScrollExtent - 200 &&
          !_isLoadingMore) {
        loadMore();
      }
    });
  }

  Future<List<Movie>> fetchMovies({required int page}) async {
    await Future.delayed(const Duration(seconds: 4));

    List<Map<String, dynamic>> fakeJson = List.generate(10, (index) {
      int id = (page - 1) * 10 + index;
      return {
        "id": id,
        "title": "Movie $id",
        "image":
            "https://picsum.photos/400/600?random=$id",
        "duration": "${90 + index} min",
        "description":
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      };
    });

    return fakeJson.map((e) => Movie.fromJson(e)).toList();
  }

  void loadMore() async {
    setState(() => _isLoadingMore = true);

    _page++;
    final newMovies = await fetchMovies(page: _page);

    setState(() {
      _movies.addAll(newMovies);
      _isLoadingMore = false;
    });
  }

  void reload() {
    setState(() {
      _page = 1;
      _movies.clear();
      _future = fetchMovies(page: _page);
    });
  }

  void showMovieDetails(Movie movie) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.black,
      builder: (_) {
        return DraggableScrollableSheet(
          expand: false,
          builder: (_, controller) {
            return SingleChildScrollView(
              controller: controller,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.network(movie.image,
                      width: double.infinity,
                      height: 300,
                      fit: BoxFit.cover),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(movie.title,
                            style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: Colors.white)),
                        const SizedBox(height: 8),
                        Text(movie.duration,
                            style: const TextStyle(color: Colors.grey)),
                        const SizedBox(height: 16),
                        Text(movie.description,
                            style: const TextStyle(color: Colors.white70)),
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
  }

  Widget buildMovieCard(Movie movie) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            children: [
              Positioned.fill(
                child: Image.network(
                  movie.image,
                  fit: BoxFit.cover,
                ),
              ),
              Positioned.fill(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.bottomCenter,
                      end: Alignment.topCenter,
                      colors: [
                        Colors.black87,
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        Positioned(
          left: 12,
          right: 12,
          bottom: 12,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(movie.title,
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold)),
              Text(movie.duration,
                  style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.play_arrow,
                        color: Colors.white),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: const Icon(Icons.favorite_border,
                        color: Colors.white),
                    onPressed: () {},
                  ),
                  IconButton(
                    icon: const Icon(Icons.info_outline,
                        color: Colors.white),
                    onPressed: () => showMovieDetails(movie),
                  ),
                ],
              )
            ],
          ),
        )
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text("Movies"),
        actions: [
          IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: reload),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: TextField(
              controller: _searchController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: "Search...",
                hintStyle: const TextStyle(color: Colors.grey),
                filled: true,
                fillColor: Colors.white10,
                prefixIcon:
                    const Icon(Icons.search, color: Colors.white),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(30),
                    borderSide: BorderSide.none),
              ),
              onChanged: (value) {
                setState(() => _searchQuery = value.toLowerCase());
              },
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<Movie>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState ==
              ConnectionState.waiting &&
              _movies.isEmpty) {
            return const Center(
                child: CircularProgressIndicator());
          }

          if (snapshot.hasData && _movies.isEmpty) {
            _movies = snapshot.data!;
          }

          final filtered = _movies
              .where((m) =>
                  m.title.toLowerCase().contains(_searchQuery))
              .toList();

          return GridView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(12),
            gridDelegate:
                const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.65,
            ),
            itemCount: filtered.length +
                (_isLoadingMore ? 1 : 0),
            itemBuilder: (context, index) {
              if (index < filtered.length) {
                return buildMovieCard(filtered[index]);
              } else {
                return const Center(
                    child: CircularProgressIndicator());
              }
            },
          );
        },
      ),
    );
  }
}
