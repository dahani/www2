class Channel {
  final int? id;
  final String name;
  final String url;
  final String? poster;
  final String category;
  final String? epgId;
  final bool isFavorite;

  Channel({
    this.id,
    required this.name,
    required this.url,
    this.poster,
    required this.category,
    this.epgId,
    this.isFavorite = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'url': url,
      'poster': poster,
      'category': category,
      'epgId': epgId,
      'isFavorite': isFavorite ? 1 : 0,
    };
  }

  factory Channel.fromMap(Map<String, dynamic> map) {
    return Channel(
      id: map['id'] as int?,
      name: map['name'] as String? ?? '',
      url: map['url'] as String? ?? '',
      poster: map['poster'] as String?,
      category: map['category'] as String? ?? 'Other',
      epgId: map['epgId'] as String?,
      isFavorite: (map['isFavorite'] as int? ?? 0) == 1,
    );
  }

  Channel copyWith({
    int? id,
    String? name,
    String? url,
    String? poster,
    String? category,
    String? epgId,
    bool? isFavorite,
  }) {
    return Channel(
      id: id ?? this.id,
      name: name ?? this.name,
      url: url ?? this.url,
      poster: poster ?? this.poster,
      category: category ?? this.category,
      epgId: epgId ?? this.epgId,
      isFavorite: isFavorite ?? this.isFavorite,
    );
  }
}
