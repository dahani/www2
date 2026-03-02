import 'package:dlna/services/functions.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:dlna/services/hls_proxy_server.dart'; // Import your proxy server
import 'package:dlna/services/constant.dart';

class ProxyTaskHandler extends TaskHandler {
  HlsProxyServer? _proxy;

  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {
    print("Foreground service started.xx 1");

  }

void _startProx()async{
  try {
      await _proxy?.stop();
            final ip= await getLocalIp();
              _proxy = HlsProxyServer(headers: egybestHeaders, localIp: ip);
            await _proxy!.start(port: 8080);
            //Provider.of<DlnaProvider>(context, listen: false)
            final  proxyBaseUrl = "http://$ip:8080/master.m3u8";
            FlutterForegroundTask.sendDataToMain({'proxy_url':proxyBaseUrl});
             FlutterForegroundTask.updateService(

        notificationTitle: 'DLNA Streaming',
        notificationText: 'Keeps connection alive when screen is off.\n $proxyBaseUrl',
        notificationButtons: [
          const NotificationButton(id: 'btn_stop', text: 'Stop Service'),
        ],
      );
            print("Proxy started in background x on $ip:8080");
      } on Exception catch (e) {
       print(e.toString());
      }
}
  @override
  void onReceiveData(Object data) async {
    print("onReceiveData");print(data);
    // This is where you receive the URL from your Movies Screen
    if(data=="start_proxy"){
       _startProx();
    }
    if(data=="stop_proxy"){
       await _proxy?.stop();
    }
    if (data is Map<String, dynamic>) {
      final String? action = data['action'];
      if(action=="start_proxy"){


      }

        }



  }
 @override
  Future<void> onNotificationButtonPressed(String id) async {
    if (id == 'btn_pause') {
      // Handle pause
      print('Pause clicked');
      FlutterForegroundTask.sendDataToMain('btn_pause');
    }

    if (id == 'btn_stop') {
       FlutterForegroundTask.stopService();
    }
  }
  @override
  Future<void> onDestroy(DateTime timestamp, bool isTimeout) async {
    await _proxy?.stop();
    print("Foreground service destroyed. qs");
  }

  @override
  void onRepeatEvent(DateTime timestamp) {
    // Optional: Keep the connection alive or log status
  }
}