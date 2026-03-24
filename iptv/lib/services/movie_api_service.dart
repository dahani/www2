import 'dart:convert';

import 'package:dio/dio.dart';
import '../models/movie.dart';
import '../models/actor.dart';

class MovieApiService {
   final Dio _dio = Dio(BaseOptions(
    headers: {"Referer":"https://egymovies.org"}
  ));
  static const String baseUrl = 'https://egymovies.org/api/v1';
 Dio getDio () {
  return _dio;
 }
  Future<List<MovieGenre>> fetchGenres() async {
    try {
      final response = await _dio.get(
        '$baseUrl/value-lists/titleFilterLanguages,productionCountries,genres,titleFilterAgeRatings',
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final genresList = data['genres'] as List<dynamic>? ?? [];
        return genresList.map((json) => MovieGenre.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load genres: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error parsing genres: $e');
    }
  }

 Future<Map<String, dynamic>> fetchMoviesByGenre(int genreId, int page) async {
    try {
        List<int> bytes = utf8.encode('[{"key":"genres","value":[$genreId],"operator":"hasAll"}]');
        String base64String = base64Encode(bytes);

   final url="$baseUrl/channel/Movies?restriction&order=created_at:desc&page=$page&paginate=lengthAware&returnContentOnly=true&filters=$base64String";
      final response = await _dio.get(url);

      if (response.statusCode == 200) {
        final data = response.data;
        final pagination = data['pagination'] as Map<String, dynamic>;
        final moviesData = pagination['data'] as List<dynamic>? ?? [];

        final movies = moviesData.map((json) => Movie.fromJson(json)).toList();

        return {
          'movies': movies,
          'currentPage': pagination['current_page'] as int,
          'totalPages': ((pagination['total'] as int) / (pagination['per_page'] as int)).ceil(),
          'hasNextPage': pagination['next_page'] != null,
        };
      } else {
        throw Exception('Failed to load movies: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error parsing movies: $e');
    }
  }

  Future<List<Movie>> fetchMoviesBySearch(String query) async {
    try {
   final url="$baseUrl/search/$query?loader=searchAutocomplete";
      final response = await _dio.get(url);
      if (response.statusCode == 200) {
        final data = response.data;
        final moviesData = data['results'] as List<dynamic>? ?? [];

        final movies = moviesData.map((json) => Movie.fromJson(json)).toList();
        return movies;
      } else {
        throw Exception('Failed to load movies: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error parsing movies: $e');
    }
  }

  Future<MovieDetails> fetchMovieDetails(int movieId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/titles/$movieId',
        queryParameters: {
          'loader': 'titlePage',
        },
      );

      if (response.statusCode == 200) {
        return MovieDetails.fromJson(response.data);
      } else {
        throw Exception('Failed to load movie details: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error parsing movie details: $e');
    }
  }

  Future<ActorDetails> fetchActorDetails(int actorId) async {
    try {
      final response = await _dio.get(
        '$baseUrl/people/$actorId',
        queryParameters: {
          'loader': 'personPage',
        },
      );

      if (response.statusCode == 200) {
        return ActorDetails.fromJson(response.data);
      } else {
        throw Exception('Failed to load actor details: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error parsing actor details: $e');
    }
  }

  Future<List<Movie>> searchMovies(String query) async {
    try {
      final response = await _dio.get(
        '$baseUrl/search/$query',
        queryParameters: {
          'loader': 'searchAutocomplete',
        },
      );

      if (response.statusCode == 200) {
        final data = response.data;
        final results = data['results'] as List<dynamic>? ?? [];
        return results.map((json) => Movie.fromJson(json)).toList();
      } else {
        throw Exception('Failed to search movies: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error searching movies: $e');
    }
  }
}
