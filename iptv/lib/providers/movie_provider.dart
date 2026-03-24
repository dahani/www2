import 'package:flutter/material.dart';
import '../models/movie.dart';
import '../services/movie_api_service.dart';

class MovieProvider extends ChangeNotifier {
  final MovieApiService _api = MovieApiService();

  List<MovieGenre> _genres = [];
  List<Movie> _movies = [];
  MovieGenre? _selectedGenre;
  bool _isLoading = false;
  String? _error;
  int _currentPage = 1;
  bool _hasNextPage = false;

  List<MovieGenre> get genres => _genres;
  List<Movie> get movies => _movies;
  MovieGenre? get selectedGenre => _selectedGenre;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get currentPage => _currentPage;
  bool get hasNextPage => _hasNextPage;

  Future<void> loadGenres() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _genres = await _api.fetchGenres();
      _isLoading = false;
       selectFirstGenre();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> selectGenre(MovieGenre genre) async {
    _selectedGenre = genre;
    _currentPage = 1;
    _movies = [];
    notifyListeners();

    await loadMovies();
  }
    Future<void> selectFirstGenre() async {
    _selectedGenre = _genres.first;
    _movies = [];
    await loadMovies();
  }
  Future<void> loadSearch(String query) async {
print(query);
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _api.fetchMoviesBySearch(query);
_movies = result;
      _hasNextPage = false;
      _isLoading = false;
      notifyListeners();
    } catch (e) {print(e.toString());
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMovies() async {
    if (_selectedGenre == null) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await _api.fetchMoviesByGenre(_selectedGenre!.value, _currentPage);

      _movies = result['movies'] as List<Movie>;
      _hasNextPage = result['hasNextPage'] as bool;

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMoreMovies() async {
    if (_selectedGenre == null || !_hasNextPage || _isLoading) return;

    _currentPage++;

    try {
      final result = await _api.fetchMoviesByGenre(_selectedGenre!.value, _currentPage);

      final newMovies = result['movies'] as List<Movie>;
      _movies.addAll(newMovies);
      _hasNextPage = result['hasNextPage'] as bool;

      notifyListeners();
    } catch (e) {
      _currentPage--; // Revert page increment on error
      _error = e.toString();
      notifyListeners();
    }
  }

  void clearSelection() {
    _selectedGenre = null;
    _movies = [];
    _currentPage = 1;
    notifyListeners();
  }
}
