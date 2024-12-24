# How to run

1. Prepare Env file .env.local
2. Put these values in that file
```env
BASE_URL = "localhost:3000"
PORT = "3000"
THUMBNAIL_CACHE_TTL = "3600"
```
3. Run this line in your terminal or command prompt
```bash
npm run start
```
4. Put this url in your browser or postman
```
http://localhost:3000/video/thumbnails?url=https://www.sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4&type=file
```

The server will return response with format like this 
```
{
  "thumbnails": [
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-1.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-1.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-10.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-10.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-2.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-2.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-3.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-3.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-4.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-4.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-5.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-5.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-6.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-6.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-7.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-7.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-8.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-8.png"
    },
    {
      "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-9.png",
      "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-9.png"
    }
  ],
  "animatedThumbnail": {
    "relativePath": "/uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/animated-thumbnails/animated-thumbnail.mp4",
    "url": "http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/animated-thumbnails/animated-thumbnail.mp4"
  }
}
```
5. Open url to get the thumbnail or animated thumbnail
```
http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/animated-thumbnails/animated-thumbnail.mp4

http://localhost:3000//uploads/9de3c74b-50b2-42e2-843e-1619907be9e1/thumbnails/thumbnail-9.png
```
