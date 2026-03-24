import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import 'package:tv_app/services/foreground_task_handler.dart';
import 'package:tv_app/services/functions.dart';
import '../providers/movie_provider.dart';
import '../models/movie.dart';
import 'movie_details_screen.dart';
@pragma('vm:entry-point')
void startCallback() {
  FlutterForegroundTask.setTaskHandler(ProxyTaskHandler());
}
class MoviesScreen extends StatefulWidget {
  const MoviesScreen({super.key});

  @override
  State<MoviesScreen> createState() => _MoviesScreenState();
}

class _MoviesScreenState extends State<MoviesScreen> {
  final ScrollController _scrollController = ScrollController();
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
      proxyUrl = proxy;
       print(data);
      }
    }

    debugPrint('onReceiveTaskData: $data');
    //
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MovieProvider>().loadGenres();
    });

    _scrollController.addListener(_onScroll);
     WidgetsBinding.instance.addPostFrameCallback((_) {
      // Request permissions and initialize the service.
      _requestPermissions();
      _initService();
      _startService();
      FlutterForegroundTask.addTaskDataCallback(_onReceiveTaskData);

 context.read<MovieProvider>().selectFirstGenre();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent - 200) {
      context.read<MovieProvider>().loadMoreMovies();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F0F0F),
      body: Row(
        children: [

          _buildSidebar(),
          Expanded(child: _buildMovieGrid()),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 200,
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha:0.3),
            blurRadius: 10,
            offset: const Offset(2, 0),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
        const  SizedBox(height:30,),
          TextField(
                      autofocus: false,
                      style: const TextStyle(color: Colors.white, fontSize: 18),
                      decoration: InputDecoration(
                        hintText: 'Search channels...',
                        hintStyle: const TextStyle(color: Colors.grey),
                        filled: true,
                        fillColor: const Color(0xFF2A2A2A),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(
                            color: Color(0xFFE50914),
                            width: 2,
                          ),
                        ),
                        prefixIcon: const Icon(Icons.search, color: Colors.grey),

                      ),
                      onSubmitted: (value) {
                          if (value.isEmpty) return;
                          context.read<MovieProvider>().loadSearch(value);
                      },
                    ),
         const SizedBox(height: 20,),
        //  _buildHeader(),
          const Divider(color: Color(0xFF333333), height: 1),
          Expanded(child: _buildGenreList()),
        ],
      ),
    );
  }

  Widget _buildGenreList() {
    return Consumer<MovieProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading && provider.genres.isEmpty) {
          return const Center(
            child: SpinKitFadingCircle(color: Color(0xFF1E88E5), size: 60),
          );
        }

        if (provider.genres.isEmpty) {
          return const Center(
            child: Text(
              'No genres available',
              style: TextStyle(color: Colors.grey),
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: provider.genres.length,
          itemBuilder: (context, index) {
            final genre = provider.genres[index];
            final isSelected = provider.selectedGenre?.value == genre.value;

            return Focus(
              onKeyEvent: (node, event) {
                if (event is KeyDownEvent &&
                    (event.logicalKey == LogicalKeyboardKey.select ||
                        event.logicalKey == LogicalKeyboardKey.enter)) {
                  provider.selectGenre(genre);
                  return KeyEventResult.handled;
                }
                return KeyEventResult.ignored;
              },
              child: Builder(
                builder: (context) {
                  final isFocused = Focus.of(context).hasFocus;

                  return InkWell(
                    onTap: () => provider.selectGenre(genre),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF1E88E5) : Colors.transparent,
                        borderRadius: BorderRadius.circular(8),
                        border: isFocused && !isSelected
                            ? Border.all(color: const Color(0xFF1E88E5), width: 2)
                            : null,
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.movie_filter,
                            color: isSelected || isFocused ? Colors.white : Colors.grey,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              genre.name,
                              style: TextStyle(
                                color: isSelected || isFocused ? Colors.white : Colors.grey,
                                fontSize: 16,
                                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildMovieGrid() {
    return Consumer<MovieProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading && provider.movies.isEmpty) {
          return const Center(
            child: SpinKitFadingCircle(color: Color(0xFF1E88E5), size: 60),
          );
        }

        if (provider.error != null && provider.movies.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 60),
                const SizedBox(height: 16),
                Text(
                  'Error: ${provider.error}',
                  style: const TextStyle(color: Colors.white70),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => provider.loadMovies(),
                  icon: const Icon(Icons.refresh),
                  label: const Text('Retry'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E88E5),
                  ),
                ),
              ],
            ),
          );
        }

        if (provider.movies.isEmpty && provider.selectedGenre == null) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.movie, color: Colors.grey, size: 80),
                SizedBox(height: 16),
                Text(
                  'Select a genre to view movies',
                  style: TextStyle(color: Colors.white70, fontSize: 18),
                ),
              ],
            ),
          );
        }

        if (provider.movies.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.movie_filter, color: Colors.grey, size: 80),
                SizedBox(height: 16),
                Text(
                  'No movies in this genre',
                  style: TextStyle(color: Colors.white70, fontSize: 18),
                ),
              ],
            ),
          );
        }

        return GridView.builder(
          controller: _scrollController,
          padding: const EdgeInsets.all(24),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 5,
            childAspectRatio: 0.7,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: provider.movies.length + (provider.hasNextPage ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == provider.movies.length) {
              return const Center(
                child: CircularProgressIndicator(color: Color(0xFF1E88E5)),
              );
            }
            final movie = provider.movies[index];
            return _buildMovieCard(movie);
          },
        );
      },
    );
  }

  Widget _buildMovieCard(Movie movie) {
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
                                child: const Center(
                                  child: Icon(Icons.movie, color: Colors.grey, size: 40),
                                ),
                              ),
                              errorWidget: (context, url, error) => Container(
                                color: const Color(0xFF2A2A2A),
                                child: const Center(
                                  child: Icon(Icons.movie, color: Colors.grey, size: 40),
                                ),
                              ),
                            )
                          : Container(
                              color: const Color(0xFF2A2A2A),
                              child: const Center(
                                child: Icon(Icons.movie, color: Colors.grey, size: 40),
                              ),
                            ),
                    ),
                    // Movie Info
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            movie.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.star, color: Colors.amber, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                movie.rating.toStringAsFixed(1),
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                              if (movie.runtime != null) ...[
                                const SizedBox(width: 8),
                                const Icon(Icons.access_time, color: Colors.grey, size: 14),
                                const SizedBox(width: 4),
                                Text(
                                  '${movie.runtime}m',
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
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
