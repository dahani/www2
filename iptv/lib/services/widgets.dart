
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
class TvFocusButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final String tooltip;
  final FocusNode? focusNode;

  const TvFocusButton({
    super.key,
    required this.child,
    required this.onPressed,
    required this.tooltip,
    this.focusNode,
  });

  @override
  State<TvFocusButton> createState() => _TvFocusButtonState();
}

class _TvFocusButtonState extends State<TvFocusButton> {
  late FocusNode _focusNode;
  bool _hasFocus = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();

    _focusNode.addListener(() {
      if (mounted) {
        setState(() {
          _hasFocus = _focusNode.hasFocus;
        });
      }
    });
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose(); // only dispose if internally created
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      focusNode: _focusNode,
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent) {
          // ✅ OK / ENTER button
          if (event.logicalKey == LogicalKeyboardKey.select ||
              event.logicalKey == LogicalKeyboardKey.enter) {
            widget.onPressed?.call();
            return KeyEventResult.handled;
          }
        }
        return KeyEventResult.ignored;
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        transform: _hasFocus
            ? (Matrix4.identity()..scale(1.1))
            : Matrix4.identity(),
        decoration: BoxDecoration(
          border: Border.all(
            color: _hasFocus ? Colors.blue : Colors.transparent,
            width: 3,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: IconButton(
          onPressed: widget.onPressed,
          icon: widget.child,
          color: Colors.white,
          iconSize: 28,
          style: IconButton.styleFrom(
            backgroundColor: const Color(0xFF333333),
            padding: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          tooltip: widget.tooltip,
        ),
      ),
    );
  }
}