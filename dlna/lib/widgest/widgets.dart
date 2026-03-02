import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

class NetworkImageWidget extends StatelessWidget {
  final String imageUrl;final BoxFit fit;
final double ?width;final double? height;
  const NetworkImageWidget({required this.imageUrl, super.key,  this.fit=BoxFit.fill,this.width, this.height});

  @override
  Widget build(BuildContext context) {
    return CachedNetworkImage(width:width ,height: height,
      imageUrl: imageUrl,
      imageBuilder: (context, imageProvider) => Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: imageProvider,
            fit: fit, // adjust based on your layout
          ),
        ),
      ),
      placeholder: (context, url) => Center(
        child: CircularProgressIndicator(
          color: Colors.blue, // customize your loader color
        ),
      ),
      errorWidget: (context, url, error) => Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 40,
            ),
            const SizedBox(height: 8),
            const Text(
              'Failed to load image',
              style: TextStyle(color: Colors.red),
            ),
          ],
        ),
      ),
      fit: BoxFit.cover,
    );
  }
}
class StrokeText extends StatelessWidget {
  final String text;
  final double fontSize;
  final Color strokeColor;
  final Color textColor;

  const StrokeText({
    super.key,
    required this.text,
    required this.fontSize,
    required this.strokeColor,
    required this.textColor
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Text(
          text,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.bold,
            foreground: Paint()
              ..style = PaintingStyle.stroke
              ..strokeWidth = 3
              ..color = strokeColor,
          ),
        ),
        Text(
          text,
          style: TextStyle(
            fontSize: fontSize,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
      ],
    );
  }
}
