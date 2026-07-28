import { Link } from "react-router-dom";
import { Eye, MessageSquare } from "lucide-react";


export default function TopPerformingVehicles({
  vehicles = [],
}) {


  return (

    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">


      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <h3 className="text-xl font-bold text-slate-900">
            Top Performing Vehicles
          </h3>


          <p className="mt-1 text-sm text-slate-500">
            Your recently listed vehicles
          </p>

        </div>



        <Link
          to="/vehicles"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          View All
        </Link>


      </div>




      {/* Empty State */}

      {vehicles.length === 0 ? (


        <div className="flex flex-col items-center justify-center py-16">

          <div className="mb-4 text-5xl">
            🚗
          </div>


          <h4 className="text-lg font-semibold text-slate-800">
            No Vehicles Listed
          </h4>


          <p className="mt-2 text-sm text-slate-500">
            Add your first vehicle to see it here.
          </p>


        </div>


      ) : (



        <div className="divide-y divide-slate-100">


          {vehicles.map((vehicle) => {


            const image =
              vehicle?.media?.featuredImage ||

              vehicle?.image ||

              "https://placehold.co/120x80?text=Vehicle";



            const title =
              vehicle?.vehicleInfo?.title ||

              "Untitled Vehicle";



            const brand =
              vehicle?.vehicleInfo?.brand?.name ||

              vehicle?.vehicleInfo?.brand ||

              "";



            const model =
              vehicle?.vehicleInfo?.catalogModel?.name ||

              vehicle?.vehicleInfo?.catalogModel ||

              "";



            const year =
              vehicle?.vehicleInfo?.manufacturingYear ||

              "";



            const price =
              vehicle?.pricing?.price ||

              0;



            const views =
              vehicle?.viewCount ||

              vehicle?.views ||

              0;



            const leads =
              vehicle?.leadsCount ||

              0;



            const daysLabel =
              vehicle?.daysLabel ||

              "N/A";



            return (


              <div

                key={vehicle._id}

                className="
                  flex items-center gap-5
                  px-6 py-5
                  transition
                  hover:bg-slate-50
                "

              >



                {/* Image */}

                <img

                  src={image}

                  alt={title}

                  className="
                    h-20 w-28
                    rounded-xl
                    border border-slate-200
                    object-cover
                  "

                />





                {/* Details */}

                <div className="min-w-0 flex-1">


                  <h4 className="truncate text-base font-semibold text-slate-900">

                    {title}

                  </h4>



                  <p className="mt-1 text-sm text-slate-500">

                    {brand}

                    {model && ` ${model}`}

                    {year && ` • ${year}`}

                  </p>




                  <p className="mt-2 text-lg font-bold text-blue-600">

                    BHD {Number(price).toLocaleString("en-GB")}

                  </p>




                  {/* Subscription Days */}

                  <p className="mt-1 text-xs font-medium text-green-600">

                    {daysLabel}

                  </p>



                </div>






                {/* Views */}

                <div className="flex w-24 flex-col items-center">


                  <Eye
                    size={18}
                    className="mb-1 text-slate-400"
                  />


                  <span className="text-lg font-bold text-slate-900">

                    {Number(views).toLocaleString("en-GB")}

                  </span>


                  <span className="text-xs text-slate-400">

                    Views

                  </span>


                </div>






                {/* Leads */}

                <div className="flex w-24 flex-col items-center">


                  <MessageSquare

                    size={18}

                    className="mb-1 text-blue-500"

                  />


                  <span className="text-lg font-bold text-blue-600">

                    {Number(leads).toLocaleString("en-GB")}

                  </span>


                  <span className="text-xs text-slate-400">

                    Leads

                  </span>


                </div>




              </div>


            );

          })}



        </div>


      )}


    </div>

  );

}