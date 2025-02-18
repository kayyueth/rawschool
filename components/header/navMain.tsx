export default function NavMain() {
  return (
    <div className="flex ml-20 mr-20 mt-4 justify-between text-xl border-b-2 border-black">
      <div className="mb-4">
        <a href="/home" className="ml-8">
          Bookclub Calender
        </a>
        <a href="/graphics" className="ml-8">
          DeSci Wiki
        </a>
      </div>

      <div>
        <a href="/wiki" className="mr-8">
          Join Us
        </a>
      </div>
    </div>
  );
}
