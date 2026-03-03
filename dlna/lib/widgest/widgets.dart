import 'package:dlna/models/models.dart';
import 'package:dlna/screens/full_image_viewer.dart';
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

Widget actorCard(Actor actor ){
return  Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: Colors.grey[800],
            backgroundImage: actor.poster != null
                ? CachedNetworkImageProvider(actor.poster!)
                : null,
            child: actor.poster == null
                ? const Icon(
                    Icons.person,
                    color: Colors.white54,
                  )
                : null,
          ),
          const SizedBox(height: 10),
          Text(
            actor.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          Text(
            actor.character,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 10,
            ),
          ),
        ],
      );
}

class FullWidthGallery extends StatefulWidget {
  final List<String> images;

  const FullWidthGallery({super.key, required this.images});

  @override
  State<FullWidthGallery> createState() => _FullWidthGalleryState();
}

class _FullWidthGalleryState extends State<FullWidthGallery> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 50,),
        SizedBox(
          height: 250, // Height of the gallery
          width: double.infinity,
          child: Stack(
            alignment: Alignment.bottomCenter,
            children: [
              PageView.builder(
                controller: _pageController,
                itemCount: widget.images.length,
                onPageChanged: (int index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemBuilder: (context, index) {
final imageUrl = widget.images[index];
                  return GestureDetector(
                   onTap: () {
      Navigator.push(
        context,
        PageRouteBuilder(
          transitionDuration: const Duration(milliseconds: 600), // Slower for better effect
          pageBuilder: (_, _, _) => FullScreenImageViewer(imageUrl: imageUrl),
        ),
      );
    },
                    child: Hero(tag: imageUrl,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 5),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: NetworkImageWidget(
                            imageUrl:imageUrl,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
              // Indicator Dots
              Positioned(
                bottom: 15,
                child: Row(
                  children: List.generate(
                    widget.images.length,
                    (index) => AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      height: 8,
                      width: _currentPage == index ? 24 : 8,
                      decoration: BoxDecoration(
                        color: _currentPage == index ? Colors.redAccent : Colors.white38,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}