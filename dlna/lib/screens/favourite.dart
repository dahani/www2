import 'dart:convert';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:dlna/player/HlsPlayerPage.dart';
import 'package:dlna/player/betterplayer.dart';
import 'package:dlna/services/database_service.dart';
import 'package:dlna/services/dlnaProvider.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
class FavouritesPage extends StatefulWidget {
  const FavouritesPage({super.key});

  @override
  State<FavouritesPage> createState() => _FavouritesPageState();
}

class _FavouritesPageState extends State<FavouritesPage> {
  List<Map<String, dynamic>> _favourite= [];
 late DlnaService dlnaService;
 bool loading=true;
 @override
 void initState() {
   super.initState();
  getFavs();
   dlnaService =  Provider.of<DlnaProvider>(context, listen: false).dlnaService;
 }
 void getFavs({bool isFirst=false})async{
 _favourite=await DatabaseService.instance.getFavourites();
     setState(() { loading=false;});
}
   void _play(String url,String ch) async {
    /* final finalurl=await resolvePlayableUrl("https://www.youtube.com/live/qs8Wrk81wPo?si=RCzah78IoRDDShHt");
    print(finalurl);*/
    await dlnaService.playWithTitle(url, ch);
    //    _showControlsBottomSheet();
  }
 Widget buildslisTile(dynamic ch,int indexd){
    String? url = ch['url'];

                if (url == null && ch['resolutions'] != null) {
                  final resolutions = jsonDecode(ch['resolutions']);
                  url = resolutions.entries.first.value['url'];
                }
  return Container(
     color:dlnaService.selectedChannel['id']==ch['id']? (dlnaService.isDarkMode?Colors.black: Colors.lime):null,
    child: ListTile(
                trailing: IconButton(
                  icon: Icon(
                    ch['is_fav'] == 1 ? Icons.favorite : Icons.favorite_border,
                    color: ch['is_fav'] == 1 ? Colors.red : null,
                  ),
                  onPressed: () async {
                    final newValue = ch['is_fav'] == 1 ? 0 : 1;
                    await DatabaseService.instance.setFavourite(ch['id'],newValue == 1,);
                    getFavs();
                  },
                ),

                leading: CachedNetworkImage(
                  imageUrl: ch['poster'] ?? "",
                  width: 50,
                  height: 50,
                  placeholder: (_, _) => const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(),
                  ),
                  errorWidget: (_, _, _) => const Icon(Icons.error),
                ),
                title: Text(ch['name']),
                onLongPress: () {
                  Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>  HlsPlayerPagebetter(
                                url: url ?? "",
                                title: ch['name'],
                                categoryId: ch['category_id'].toString(),
                              )
                      ),
                    );
                },
                onTap: () {
                 setState(() {
                    dlnaService.setChannel(ch);
                 });
                  if (!dlnaService.isConnected || dlnaService.selectedDevice == null) {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>  HlsPlayerPage(
                                url: url ?? "",
                                title: ch['name'],currentIndex: indexd,
                                categoryId: ch['category_id'].toString(),
                                listChannels: _favourite,
                              )
                      ),
                    );
                  } else {
                    _play(url ?? "", ch['name']);
                  }
                }
              ),
  );
}


  Future<void> _clearAll() async {

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Clear all favourites?"),
        content: const Text(
            "This action cannot be undone."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Clear"),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await DatabaseService.instance.clearAllFavourites();

      setState(() {
        getFavs();
      });
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Favourites"),actions: [
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: _clearAll,
          ),
        ],),
      body: loading?Center(child: CircularProgressIndicator()):
           _favourite.isEmpty?Center(child: Text("No Favourite Found"),) : ListView.builder(
            itemCount: _favourite.length,
            itemBuilder: (_, index) {
              final ch = _favourite[index];
              return buildslisTile(ch,index);
            },
          )
    );
        }

}
