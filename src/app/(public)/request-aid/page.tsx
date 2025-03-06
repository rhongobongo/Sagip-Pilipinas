import RequestMap from "@/components/map/RequestAidMapWrapper";

const RequestAidPage: React.FC = () => {
  return (
    <>
      <div className="w-full flex justify-center items-center pt-10">
        <RequestMap width="80vw" height="60vh"></RequestMap>
      </div>
      <div className="flex justify-center items-center ml-auto mr-auto gap-10 pt-8 w-[80vw]">
        <div className="grid gap-5">
          <input type="text" color="black" className=""></input>
          <input type="text" color="black"></input>
        </div>
        <div className="grid gap-5">
          <input type="select" color="black"></input>
          <input type="select" color="black"></input>
        </div>
      </div>
      <div className="flex justify-center items-center pt-5">
        <input type="textarea" className="w-max"></input>
      </div>
    </>
  );
};

export default RequestAidPage;
