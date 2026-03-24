class Playlist {
  final int? id;
  final String name;
  final String? icon;
  final int channelCount;

  Playlist({
    this.id,
    required this.name,
    this.icon,
    this.channelCount = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
    };
  }

  factory Playlist.fromMap(Map<String, dynamic> map) {
    return Playlist(
      id: map['id'] as int?,
      name: map['name'] as String,
      icon: map['icon'] as String?,
      channelCount: map['channelCount'] as int? ?? 0,
    );
  }

  Playlist copyWith({
    int? id,
    String? name,
    String? icon,
    int? channelCount,
  }) {
    return Playlist(
      id: id ?? this.id,
      name: name ?? this.name,
      icon: icon ?? this.icon,
      channelCount: channelCount ?? this.channelCount,
    );
  }
}
