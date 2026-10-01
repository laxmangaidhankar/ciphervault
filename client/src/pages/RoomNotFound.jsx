

const RoomNotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white">
      <h1 className="text-4xl font-bold">
        Room Not Found
      </h1>

      <p className="mt-3 text-gray-400">
        This room doesn't exist or is no longer available.
      </p>
    </div>
  );
};

export default RoomNotFound;