export default function NavMain() {
  return (
    <div className="flex ml-20 mr-20 mt-4 justify-between text-xl border-b-2 border-black">
      <div className="mb-4">
        <a href="/home" className="">
          Bookclub Calender
        </a>
        <a href="/list" className="ml-8">
          Reading List
        </a>
        <a href="/graphics" className="ml-8">
          Crypto Humanities Infographics
        </a>
      </div>

      <div>
        <a href="/wiki" className="mr-8">
          DeSci Wikipedia
        </a>
        <a href="/classroom" className="">
          Raw Classroom
        </a>
      </div>
    </div>
  );
}
