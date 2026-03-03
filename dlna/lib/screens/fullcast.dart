import 'package:dlna/widgest/widgets.dart';
import 'package:flutter/material.dart';
import 'package:dlna/models/models.dart'; // Adjust based on your file structure

class FullCastScreen extends StatelessWidget {
  final dynamic data;
  final String movieTitle;

  const FullCastScreen({super.key, required this.movieTitle, this.data});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1014),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F1014),
        elevation: 0,
        title: Text("Cast: $movieTitle",
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),body:  CustomScrollView(
              slivers: [
                ...buildCreditsSlivers(),
SliverToBoxAdapter(
  child:  SizedBox(height:30 ,),
)
              ],
            ),

    );
  }

  List<Widget> buildCreditsSlivers() {
  final List<Widget> slivers = [];

  data.forEach((key, value) {
    final List<dynamic> persons = value;

    // Title
    slivers.add(
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Text(
            key.toUpperCase(),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );

    // Grid
    slivers.add(
      SliverPadding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        sliver: SliverGrid(
          gridDelegate:
              const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            childAspectRatio: 0.75,
          ),
          delegate: SliverChildBuilderDelegate(
            (context, index) {
              final person =Actor.fromJson(persons[index]);

              return actorCard(person);
            },
            childCount: persons.length,
          ),
        ),
      ),
    );
  });

  return slivers;
}

}