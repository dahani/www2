import 'package:dlna/models/models.dart';
import 'package:dlna/services/dlna_provider.dart';
import 'package:dlna/services/dlna_service.dart';
import 'package:dlna/services/functions.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

class TVControlBottomSheet extends StatefulWidget {
      final void Function(String command, dynamic val) onlcik;final bool isMovie;
  const TVControlBottomSheet({super.key, required this.onlcik, this.isMovie=false});

  @override
  State<TVControlBottomSheet> createState() => _TVControlBottomSheetState();
}

class _TVControlBottomSheetState extends State<TVControlBottomSheet> {
  bool isPowerOn = true;
  double volume = 7.0;
  double seek=0;
  String currentApp = "Netflix";
  bool isMute=false;
   late DlnaService dlnaService;
   String playerState="STOPED";
@override
void initState() {
  super.initState();
    dlnaService =  Provider.of<DlnaProvider>(context, listen: false).dlnaService;
initSlider();

}
Future<void> initSlider() async {

  seek = 0;
   playerState=await dlnaService.getTransportState()??"STOPPED";
   print(playerState);
 dlnaService.statePlaying=playerState;
 setState(() {

 });
}

  void _handleCommand(String command,{String val=""}) {

    widget.onlcik(command,val);
    if(command=="mute"){
      setState(() {
         isMute=!isMute;
       });
       dlnaService.setMute(isMute);
    }
     setState(() {

    });



  }

  @override
  Widget build(BuildContext context) {
    ChannelModel selectedCh=dlnaService.selectedChannel;
    return Container(
      decoration:  BoxDecoration(
        color: dlnaService.isDarkMode ? const Color.fromARGB(255, 51, 48, 48) : Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 25),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
            Text(
            dlnaService.selectedDevice != null
              ? dlnaService.selectedDevice!.name
              : "Connect To TV",
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
            ),
            Text(
            dlnaService.selectedDevice != null
              ? dlnaService.selectedChannel.name:'',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
            ),
          const SizedBox(height: 15),

          // Passing functions to the D-Pad
          Row(
             mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: <Widget>[
                        Container(
                          width: 60,
                          height: 170,
                          decoration:  BoxDecoration(
                            color:dlnaService.isDarkMode ? Colors.black :  Colors.blue[800],
                            borderRadius:  BorderRadius.all(
                              Radius.circular(40.0),
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: <Widget>[
                              IconButton(onPressed: () {
                                dlnaService.volumeUp();
                              }, icon: Icon(
                                Icons.add,color: Colors.white,
                                size: 38,
                              ),),
                              Text(
                                "Vol",
                                style: TextStyle(color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 24,
                                ),
                              ),
                              IconButton(onPressed: () {
                                dlnaService.volumeDown();
                              }, icon: Icon(
                                Icons.remove,color: Colors.white,
                                size: 38,
                              ),)
                            ],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(width: 10,),
              RemoteDPad(dla: dlnaService,
                isMute: isMute,
                onDirectionPressed: (direction) => _handleCommand(direction),
                onOkPressed: () {  dlnaService.togglePlayPause();
                   setState(() {

                 });
                },
              ),
               SizedBox(width: 10,),
                Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: <Widget>[
                        Container(
                          width: 60,
                          height: 170,
                          decoration:  BoxDecoration(
                            color:dlnaService.isDarkMode ? Colors.black :  Colors.blue[800],
                            borderRadius:  BorderRadius.all(
                              Radius.circular(40.0),
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceAround,
                            children: <Widget>[
                              IconButton(onPressed: () {
                               _handleCommand("next");
                              }, icon: Icon(
                                Icons.add,color: Colors.white,
                                size: 38,
                              ),),
                              Text(
                                "Ch",
                                style: TextStyle(color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 24,
                                ),
                              ),
                              IconButton(onPressed: () {
                                _handleCommand("prev");
                              }, icon: Icon(
                                Icons.remove,color: Colors.white,
                                size: 38,
                              ),)
                            ],
                          ),
                        ),
                      ],
                    ),

            ],
          ),

          const SizedBox(height: 10),

          Row(
            children: [
             IconButton(onPressed: () {
                setState(() {
                  volume = (volume - 1).clamp(0, 100);
                  dlnaService.setVolume(volume.toInt());
                });
             }, icon:Icon( Icons.volume_mute, color: Colors.blue[300])) ,
              Expanded(
                child: Slider(
                  value: volume,
                  max: 30,
                  activeColor: Colors.blue[700],
                  onChanged: (val) => setState(() => volume = val),
                  onChangeEnd: (val) {
                    dlnaService.setVolume(val.toInt());
                  }
                ),
              ),
              IconButton(onPressed: () {
                setState(() {
                  volume = (volume + 1).clamp(0, 100);
                  dlnaService.setVolume(volume.toInt());
                });
             },icon:   Icon(Icons.volume_up, color: Colors.blue[300])),
            ],
          ),

  const SizedBox(height: 10),
      Visibility(visible:widget.isMovie,
        child: Row(
              children: [
              IconButton(onPressed: () {_handleCommand("seek_prev");}, icon:  Icon( Icons.fast_rewind, color: Colors.blue[300]) ),
                Expanded(
                  child: Slider(
                    value: seek,
                    max:dlnaService.videoDuration.toDouble(),
                    activeColor: Colors.blue[700],onChanged: (val) => setState(() => seek = val),
                    onChangeEnd: (val) {
                      _handleCommand("seek",val: val.toInt().toString());
                    }
                  ),
                ),
                   IconButton(onPressed: () {
                    _handleCommand("seek_next");
                   }, icon:  Icon(Icons.fast_forward, color: Colors.blue[300]),),

              ],
            ),
      ),

          Visibility(
            visible: dlnaService.selectedChannel.id!=-1 && !widget.isMovie,
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                  IconButton(
                  icon: const Icon(Icons.copy,color: Colors.blue,),
                  onPressed: () {
              Clipboard.setData(
                ClipboardData(text: selectedCh.url),
              );
            },
                    ),
                     IconButton(
                  icon: const Icon(Icons.open_in_new,color: Colors.blue,),
                  onPressed: () async {
                    await openM3U(selectedCh.url);
                  },
                ),
                 IconButton(
                  icon: const Icon(Icons.share,color: Colors.blue,),
                  onPressed: () async {
                    SharePlus.instance.share(
            ShareParams(uri: Uri.parse(selectedCh.url)),
                    );
                  },
                ),
                IconButton(
                  icon:  Icon( Icons.timer,color: Colors.blue,),
                  onPressed: (){
                     _handleCommand("timer");
                  },
                ),
                IconButton(
                  icon:  Icon( Icons.arrow_back,color: Colors.blue,),
                  onPressed: (){
                     _handleCommand("prevChannel");
                  },
                ),
              ],
            ),
          ),
            const SizedBox(height: 40),

        ],
      ),
    );
  }

}

class RemoteDPad extends StatelessWidget {
  final Function(String) onDirectionPressed;
  final VoidCallback onOkPressed;
  final bool isMute;
  final DlnaService dla;

  const RemoteDPad({
    super.key,
    required this.onDirectionPressed,
    required this.onOkPressed, required this.isMute, required this.dla
  });


  @override
  Widget build(BuildContext context) {
bool isPlaying=dla.statePlaying == "PLAYING";
print(isPlaying);
    return Container(
      width: 210,
      height: 210,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color:dla.isDarkMode ? Colors.black :  Colors.blue[800],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Center OK Button
             InkWell(
              onTap: onOkPressed,
              child: Container(
            width: 90,
            height: 90,
            decoration:  BoxDecoration(
              color:dla.isDarkMode?const Color.fromARGB(255, 84, 80, 80): Colors.white,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child:Icon(isPlaying? Icons.pause:Icons.play_arrow,size: 45,),

          ),
             ),
          // Directional Arrows
       _arrow(Alignment.topCenter, isMute?Icons.volume_off: Icons.volume_up, "mute"),
          _arrow(Alignment.bottomCenter, Icons.stop, "stop"),
          _arrow(Alignment.centerLeft, Icons.skip_previous, "prev"),
          _arrow(Alignment.centerRight, Icons.skip_next, "next"),
        ],
      ),
    );

  }

  Widget _arrow(Alignment align, IconData icon, String direction) {
    return Align(
      alignment: align,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => onDirectionPressed(direction),
          customBorder: const CircleBorder(),
          child: Padding(
            padding: const EdgeInsets.all(15.0),
            child: Icon(icon, color: Colors.white, size: 45),
          ),
        ),
      ),
    );
  }
}