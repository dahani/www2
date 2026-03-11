import 'package:dlna/services/constant.dart';
import 'package:dlna/widgest/server_preferences.dart';
import 'package:flutter/material.dart';
class ServerSelectionScreen extends StatefulWidget {
  const ServerSelectionScreen({super.key});

  @override
  State<ServerSelectionScreen> createState() => _ServerSelectionScreenState();
}

class _ServerSelectionScreenState extends State<ServerSelectionScreen> {

  String? selectedServer;

  @override
  void initState() {
    super.initState();
    loadSelected();
  }

  void loadSelected() async {
    final saved = await ServerPreferences.getServer();
    setState(() {
      selectedServer = saved;
    });
  }

  void selectServer(String url) async {
    await ServerPreferences.saveServer(url);
    setApiUrl(url);
    setState(() {
      selectedServer = url;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Server saved: $url")),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Select Server")),
      body: ListView.builder(
        itemCount: ServerConfig.servers.length,
        itemBuilder: (context, index) {

          final url = ServerConfig.servers[index];

          return RadioListTile<String>(
            title: Text(url),
            value: url,
            groupValue: selectedServer,
            onChanged: (value) {
              if (value != null) {
                selectServer(value);
              }
            },
          );
        },
      ),
    );
  }
}
