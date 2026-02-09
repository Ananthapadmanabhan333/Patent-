import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../services/coach_service.dart';

class CoachScreen extends StatefulWidget {
  const CoachScreen({super.key});

  @override
  State<CoachScreen> createState() => _CoachScreenState();
}

class _CoachScreenState extends State<CoachScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;
  final ScrollController _scrollController = ScrollController();

  final CoachService _coachService = CoachService();

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  void _loadHistory() async {
    final history = await _coachService.fetchChatHistory();
    if (mounted) {
      setState(() {
        _messages.clear();
        _messages.addAll(history);
        if (_messages.isEmpty) {
           _messages.add({"text": "Hello! I am your AI Performance Coach. How are you feeling today?", "isMe": false});
        }
      });
      // Scroll to bottom after slight delay for rendering
      Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
    }
  }

  void _sendMessage() async {
    if (_controller.text.isEmpty) return;
    
    final userText = _controller.text;
    setState(() {
      _messages.add({"text": userText, "isMe": true});
      _isTyping = true;
    });
    _controller.clear();
    _scrollToBottom();

    // Call API
    String aiResponse = await _coachService.sendMessage(userText);

    if (mounted) {
      setState(() {
        _isTyping = false;
        _messages.add({"text": aiResponse, "isMe": false});
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Row(
          children: [
            Icon(Icons.psychology, color: AppTheme.primaryColor),
            SizedBox(width: 8),
            Text("AI Coach"),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isTyping ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return const Align(
                    alignment: Alignment.centerLeft,
                    child: Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Text("Coach is typing...", style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)),
                    ),
                  );
                }
                final msg = _messages[index];
                return _buildMessageBubble(msg["text"], msg["isMe"]);
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            color: AppTheme.surfaceColor,
            child: Row(
              children: [
                 Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: "Tell coach how you feel...",
                      hintStyle: const TextStyle(color: Colors.white54),
                      filled: true,
                      fillColor: Colors.black12,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: AppTheme.primaryColor,
                  child: IconButton(
                    onPressed: _sendMessage,
                    icon: const Icon(Icons.send, color: Colors.black),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMessageBubble(String text, bool isMe) {
    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.all(16),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMe ? AppTheme.primaryColor : AppTheme.surfaceColor,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(0),
            bottomRight: isMe ? const Radius.circular(0) : const Radius.circular(16),
          ),
        ),
        child: Text(
          text, 
          style: TextStyle(
            fontSize: 16, 
            color: isMe ? Colors.black : Colors.white,
            height: 1.4,
          )
        ),
      ),
    );
  }
}
