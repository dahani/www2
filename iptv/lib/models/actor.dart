class Actor {
  final int id;
  final String name;
  final String? description;
  final String? gender;
  final String? birthDate;
  final String? birthPlace;
  final String? poster;
  final String? knownFor;
  final double popularity;
  final String? deathDate;

  Actor({
    required this.id,
    required this.name,
    this.description,
    this.gender,
    this.birthDate,
    this.birthPlace,
    this.poster,
    this.knownFor,
    this.popularity = 0.0,
    this.deathDate,
  });

  factory Actor.fromJson(Map<String, dynamic> json) {
    return Actor(
      id: json['id'] as int,
      name: json['name'] as String,
      description: json['description'] as String?,
      gender: json['gender'] as String?,
      birthDate: json['birth_date'] as String?,
      birthPlace: json['birth_place'] as String?,
      poster: json['poster'] as String?,
      knownFor: json['known_for'] as String?,
      popularity: (json['popularity'] as num?)?.toDouble() ?? 0.0,
      deathDate: json['death_date'] as String?,
    );
  }
}

class ActorDetails {
  final Actor person;
  final ActorCredits credits;
  final List<ActorMovie> knownFor;
  final int totalCreditsCount;

  ActorDetails({
    required this.person,
    required this.credits,
    this.knownFor = const [],
    this.totalCreditsCount = 0,
  });

  factory ActorDetails.fromJson(Map<String, dynamic> json) {
    final personData = json['person'] as Map<String, dynamic>;
    final creditsData = json['credits'] as Map<String, dynamic>? ?? {};
    final knownForData = json['knownFor'] as List<dynamic>? ?? [];

    return ActorDetails(
      person: Actor.fromJson(personData),
      credits: ActorCredits.fromJson(creditsData),
      knownFor: knownForData.map((m) => ActorMovie.fromJson(m)).toList(),
      totalCreditsCount: json['total_credits_count'] as int? ?? 0,
    );
  }
}

class ActorCredits {
  final List<ActorMovie> actors;
  final List<ActorMovie> production;

  ActorCredits({
    this.actors = const [],
    this.production = const [],
  });

  factory ActorCredits.fromJson(Map<String, dynamic> json) {
    final actorsData = json['actors'] as List<dynamic>? ?? [];
    final productionData = json['production'] as List<dynamic>? ?? [];

    return ActorCredits(
      actors: actorsData.map((m) => ActorMovie.fromJson(m)).toList(),
      production: productionData.map((m) => ActorMovie.fromJson(m)).toList(),
    );
  }

  List<ActorMovie> get allMovies {
    return [...actors, ...production];
  }
}

class ActorMovie {
  final int id;
  final String name;
  final bool isSeries;
  final String? poster;
  final String? backdrop;
  final double popularity;
  final String? releaseDate;
  final double rating;
  final String status;
  final int year;
  final String? character;
  final String? job;

  ActorMovie({
    required this.id,
    required this.name,
    this.isSeries = false,
    this.poster,
    this.backdrop,
    this.popularity = 0.0,
    this.releaseDate,
    this.rating = 0.0,
    required this.status,
    required this.year,
    this.character,
    this.job,
  });

  factory ActorMovie.fromJson(Map<String, dynamic> json) {
    final pivot = json['pivot'] as Map<String, dynamic>?;

    return ActorMovie(
      id: json['id'] as int,
      name: json['name'] as String,
      isSeries: json['is_series'] as bool? ?? false,
      poster: json['poster'] as String?,
      backdrop: json['backdrop'] as String?,
      popularity: (json['popularity'] as num?)?.toDouble() ?? 0.0,
      releaseDate: json['release_date'] as String?,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? '',
      year: json['year'] as int? ?? 0,
      character: pivot?['character'] as String?,
      job: pivot?['job'] as String?,
    );
  }
}
