"use client"

// A simple, responsive YouTube embed component
export function YouTubeEmbed({ videoId, title }: { videoId: string, title: string }) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ paddingTop: "56.25%" }} // 16:9 Aspect Ratio
    >
      <iframe
        className="absolute top-0 left-0 h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}