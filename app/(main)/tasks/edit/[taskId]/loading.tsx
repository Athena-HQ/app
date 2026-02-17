import { Skeleton } from "@/components/ui/skeleton";
import { Frame, FramePanel } from "@/components/ui/frame";

export default function EditTaskLoading() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Frame>
        <FramePanel>
          <Skeleton className="h-96 w-full" />
        </FramePanel>
      </Frame>
    </div>
  );
}
