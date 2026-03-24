import 'package:flutter/material.dart';
import '../models/channel.dart';
import '../services/database_helper.dart';
import '../services/api_service.dart';

class ChannelProvider extends ChangeNotifier {
  final DatabaseHelper _db = DatabaseHelper.instance;
  final ApiService _api = ApiService();

  List<Channel> _channels = [];
  List<String> _categories = [];
  String _selectedCategory = 'All';
  bool _isLoading = false;
  String? _error;

  List<Channel> get channels => _channels;
  List<String> get categories => _categories;
  String get selectedCategory => _selectedCategory;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<Channel> get displayedChannels {
    if (_selectedCategory == 'All') {
      return _channels;
    } else if (_selectedCategory == 'Favorites') {
      return _channels.where((c) => c.isFavorite).toList();
    } else {
      return _channels.where((c) => c.category == _selectedCategory).toList();
    }
  }

  Future<void> loadChannels() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Try to load from database first
      final dbChannels = await _db.getChannels();

      if (dbChannels.isEmpty) {
        // If database is empty, fetch from API
        await refreshChannels();
      } else {
        _channels = dbChannels;
        await _loadCategories();
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshChannels() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Fetch from API
      final apiChannels = await _api.fetchChannels();

      // Clear database and insert new channels
      await _db.clearChannels();
      await _db.insertChannels(apiChannels);

      // Reload from database
      _channels = await _db.getChannels();
      await _loadCategories();

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _loadCategories() async {
    final dbCategories = await _db.getCategories();
    _categories = ['All', 'Favorites', ...dbCategories];
  }

  void selectCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  Future<Channel> toggleFavorite(Channel channel) async {
    if (channel.id == null) channel;

    final newFavoriteStatus = !channel.isFavorite;

    await _db.toggleFavorite(channel.id!, newFavoriteStatus);

    // Update local list
    final index = _channels.indexWhere((c) => c.id == channel.id);

    if (index != -1) {
      _channels[index] = channel.copyWith(isFavorite: newFavoriteStatus);
      notifyListeners();
    }
    return channel.copyWith(isFavorite: newFavoriteStatus);
  }
}
