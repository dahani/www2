
import 'package:dlna/models/models.dart';
import 'package:dlna/screens/movie_details.dart';
import 'package:dlna/widgest/widgets.dart';
import 'package:flutter/material.dart';

class ActorDetailsScreen extends StatelessWidget {
  final ActorDetails actor;

  const ActorDetailsScreen({super.key, required this.actor});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1014),
      body: SafeArea(top: false,
        child: CustomScrollView(
          slivers: [
            // Header with Actor Image
            SliverAppBar(
              expandedHeight: 450,
              pinned: true,
              backgroundColor: const Color(0xFF0F1014),
              flexibleSpace: FlexibleSpaceBar(
                title: Text(actor.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18,color: Colors.white)),
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (actor.poster != null)
                      NetworkImageWidget(imageUrl: actor.poster!, fit: BoxFit.cover),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.transparent, Color(0xFF0F1014)],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Actor Bio/Info
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildStatRow(),
                    const SizedBox(height: 30),
                     Text("Known For  (${actor.credits.length})",
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 15),
                  ],
                ),
              ),
            ),

            // Filmography Grid
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 0.6,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _buildMovieCreditCard(actor.credits[index],context),
                  childCount: actor.credits.length,
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 50)),
         SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 30),
                     Text("Credits (${actor.creditsList.length})",
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 15),
                  ],
                ),
              ),
            ),
        SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  childAspectRatio: 0.6,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 10,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _buildMovieCreditCard(actor.creditsList[index],context),
                  childCount: actor.creditsList.length,
                ),
              ),
            ),
            // inside ActorDetailsScreen CustomScrollView

          ],
        ),
      ),
    );
  }
 Widget _buildStatRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _statItem("Role", actor.knownFor ?? "Acting"),
        _statItem("Movies", "${actor.creditsList.length}"),
        _statItem("Origin", actor.birthPlace?.split(',').last ?? "N/A"),
      ],
    );
  }

  Widget _statItem(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 12)),
        const SizedBox(height: 5),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildMovieCreditCard(MovieCredit credit,BuildContext context) {
    return GestureDetector(
      onTap: () async{
      /*   showLoading("Loading ${credit.name}Infos", context);
  final res = await DioService.get(getMovieInfos(credit.id));
  hideLoading(context);
  final movieDetails=MovieDetails.fromJson(res.data);*/
   Navigator.pushReplacement(context,MaterialPageRoute(builder: (_) =>MovieDetailsScreen(movieId: credit.id,),),);

      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: NetworkImageWidget(imageUrl:  credit.poster, fit: BoxFit.cover),
            ),
          ),
          const SizedBox(height: 5),
          Text(
            credit.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
          ),
          Text(
            credit.character ?? "Actor",
            maxLines: 1,
            style: const TextStyle(color: Colors.white54, fontSize: 10),
          ),
        ],
      ),
    );
  }
}