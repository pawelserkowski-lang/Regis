import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

// --- Constants ---
const Color kCyberBlack = Color(0xFF000000);
const Color kCyberGreen = Color(0xFF00FF41);
const Color kCyberDim = Color(0xFF003B00);
const String kBackendUrl = 'http://127.0.0.1:5000';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => SystemState()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CyberDeck Protocol',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: kCyberBlack,
        colorScheme: const ColorScheme.dark(
          primary: kCyberGreen,
          surface: kCyberBlack,
          onSurface: kCyberGreen,
        ),
        textTheme: GoogleFonts.firaCodeTextTheme(
          Theme.of(context).textTheme,
        ).apply(
          bodyColor: kCyberGreen,
          displayColor: kCyberGreen,
        ),
        useMaterial3: true,
      ),
      home: const DashboardPage(),
    );
  }
}

// --- State Management ---

class SystemState extends ChangeNotifier {
  Map<String, dynamic> _stats = {};
  final List<Map<String, String>> _chatHistory = [];
  bool _isOnline = false;
  Timer? _timer;

  Map<String, dynamic> get stats => _stats;
  List<Map<String, String>> get chatHistory => _chatHistory;
  bool get isOnline => _isOnline;

  SystemState() {
    _startMonitoring();
    // Add initial welcome message
    _chatHistory.add({
      "sender": "System",
      "message": "CyberDeck Protocol v3.0 Online. Waiting for input...",
    });
  }

  void _startMonitoring() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) async {
      await _fetchStatus();
    });
  }

  Future<void> _fetchStatus() async {
    try {
      final response = await http.get(Uri.parse('$kBackendUrl/api/status'));
      if (response.statusCode == 200) {
        _stats = json.decode(response.body);
        _isOnline = true;
      } else {
        _isOnline = false;
      }
    } catch (e) {
      _isOnline = false;
    }
    notifyListeners();
  }

  Future<void> sendMessage(String message) async {
    _chatHistory.add({"sender": "User", "message": message});
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$kBackendUrl/api/chat'),
        headers: {"Content-Type": "application/json"},
        body: json.encode({"message": message}),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _chatHistory.add({"sender": "Jules", "message": data['response']});
      } else {
        _chatHistory.add({
          "sender": "System",
          "message": "Error: ${response.statusCode} - ${response.reasonPhrase}"
        });
      }
    } catch (e) {
      _chatHistory.add({"sender": "System", "message": "Connection Error: $e"});
    }
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

// --- UI Components ---

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          border: Border.all(color: kCyberDim, width: 2),
        ),
        child: const Column(
          children: [
            HeaderWidget(),
            Expanded(
              child: Row(
                children: [
                  SizedBox(width: 300, child: StatsPanel()),
                  VerticalDivider(color: kCyberDim, width: 1),
                  Expanded(child: ChatPanel()),
                ],
              ),
            ),
            FooterWidget(),
          ],
        ),
      ),
    );
  }
}

class HeaderWidget extends StatelessWidget {
  const HeaderWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: kCyberDim)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            "CYBERDECK PROTOCOL // FLUTTER EDITION",
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          Consumer<SystemState>(
            builder: (context, state, child) {
              return Text(
                state.isOnline ? "[ ONLINE ]" : "[ OFFLINE ]",
                style: TextStyle(
                  color: state.isOnline ? kCyberGreen : Colors.red,
                  fontWeight: FontWeight.bold,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class StatsPanel extends StatelessWidget {
  const StatsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SystemState>(
      builder: (context, state, child) {
        final stats = state.stats;
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildStatRow("CPU", "${stats['cpu'] ?? 0}%"),
              _buildStatRow("RAM", "${stats['ram'] ?? 0}%"),
              _buildStatRow("BATTERY", "${stats['battery'] ?? 0}%"),
              _buildStatRow("NET I/O", "${stats['net_io'] ?? 0} KB/s"),
              const Spacer(),
              _buildScanlineEffect(),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: kCyberGreen)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildScanlineEffect() {
    return Container(
      height: 100,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            kCyberGreen.withOpacity(0.1),
            Colors.transparent,
          ],
        ),
      ),
    );
  }
}

class ChatPanel extends StatefulWidget {
  const ChatPanel({super.key});

  @override
  State<ChatPanel> createState() => _ChatPanelState();
}

class _ChatPanelState extends State<ChatPanel> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<SystemState>(context);
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: state.chatHistory.length,
            itemBuilder: (context, index) {
              final chat = state.chatHistory[index];
              final isUser = chat['sender'] == 'User';
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "[${chat['sender']}] ",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isUser ? Colors.white : kCyberGreen,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        chat['message'] ?? "",
                        style: const TextStyle(color: kCyberGreen),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(8.0),
          decoration: const BoxDecoration(
            border: Border(top: BorderSide(color: kCyberDim)),
          ),
          child: Row(
            children: [
              const Text("> ", style: TextStyle(color: kCyberGreen, fontSize: 18)),
              Expanded(
                child: TextField(
                  controller: _controller,
                  style: const TextStyle(color: kCyberGreen, fontFamily: 'Fira Code'),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    isDense: true,
                  ),
                  onSubmitted: (value) {
                    if (value.isNotEmpty) {
                      state.sendMessage(value);
                      _controller.clear();
                    }
                  },
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send, color: kCyberGreen),
                onPressed: () {
                  if (_controller.text.isNotEmpty) {
                    state.sendMessage(_controller.text);
                    _controller.clear();
                  }
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class FooterWidget extends StatelessWidget {
  const FooterWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      color: kCyberDim.withOpacity(0.3),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            "SYSTEM READY // WAITING FOR INSTRUCTION",
            style: TextStyle(fontSize: 10, letterSpacing: 2),
          ),
        ],
      ),
    );
  }
}
