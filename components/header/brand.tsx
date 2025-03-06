export default function Brand() {
  return (
    <div className="flex justify-between px-2 py-2 md:ml-20 md:mr-20 ml-5 md:px-0 md:py-0">
      <div>
        <h1 className="font-black text-[20px] md:text-[120px]">RAW SCHOOL</h1>
      </div>
      <div>
        <img
          src="Logo.svg"
          alt="Logo"
          className="h-[30px] md:mt-10 md:h-[100px]"
        />
      </div>
    </div>
  );
}
