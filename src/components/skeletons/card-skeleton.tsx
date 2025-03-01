import { CardBody, Card, Skeleton, CardFooter, Spacer } from "@heroui/react"

export const CardSkeleton = () => {
  return (
    <Card className="w-full max-w-[220px] bg-default-50 border border-white border-opacity-10" as="div">
      <CardBody className="overflow-visible p-0 aspect-square">
        <Skeleton className="h-full w-full rounded-xl" />
      </CardBody>
      <CardFooter className="text-small p-2 sm:p-3">
        <div className="flex flex-col w-full gap-2">
          <div className="flex justify-between items-start gap-2">
            <Skeleton className="w-3/4 h-4 rounded-xl" />
            <Skeleton className="w-1/4 h-4 rounded-xl" />
          </div>
          <Spacer y={2} />
          <div className="flex justify-between items-center gap-2">
            <Skeleton className="w-24 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );

}