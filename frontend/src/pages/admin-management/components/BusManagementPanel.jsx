import React, { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";
import AddBusModal from "./AddBusModal";
import EditBusModal from "./EditBusModal";

const BusManagementPanel = () => {

const { token } = useAuth();

const [buses,setBuses] = useState([]);
const [showAdd,setShowAdd] = useState(false);
const [showEdit,setShowEdit] = useState(false);
const [selectedBus,setSelectedBus] = useState(null);

const fetchBuses = async () => {

try{

const res = await fetch(`${API_BASE}/buses`,{
headers:{
Authorization:`Bearer ${token}`
}
});

const data = await res.json();

if(data.success){
    setBuses(
        data.data.buses.filter(bus => bus.status === "active")
      );}

}catch(err){
console.error("Bus fetch error:",err);
}

};

useEffect(()=>{
if(token) fetchBuses();
},[token]);

const deleteBus = async (busId) => {

if(!window.confirm("Delete this bus?")) return;

try{

await fetch(`${API_BASE}/buses/${busId}`,{
method:"DELETE",
headers:{
Authorization:`Bearer ${token}`
}
});

if(selectedBus?._id === busId){
setSelectedBus(null);
}

fetchBuses();

}catch(err){
console.error("Delete bus error:",err);
}

};

return(

<div className="space-y-6">

{/* Header */}
<div className="flex justify-between items-center">

<h2 className="text-xl font-semibold text-foreground">
Bus Management
</h2>

<Button
iconName="Plus"
onClick={()=>setShowAdd(true)}
>
Add Bus
</Button>

</div>

{/* Bus List */}
<div className="bg-card border border-border rounded-lg">

{buses.map(bus=>(

<div
key={bus._id}
onClick={()=>setSelectedBus(bus)}
className="flex items-center justify-between p-4 border-b border-border cursor-pointer hover:bg-muted/20"
>

<div>

<p className="font-medium text-foreground">
{bus.busNumber}
</p>

<p className="text-sm text-muted-foreground">
Capacity: {bus.capacity}
</p>

</div>

<div className="flex gap-2">

<Button
size="sm"
variant="outline"
onClick={(e)=>{
e.stopPropagation();
setSelectedBus(bus);
setShowEdit(true);
}}
>
Edit
</Button>

<Button
size="sm"
variant="destructive"
onClick={(e)=>{
e.stopPropagation();
deleteBus(bus._id);
}}
>
Delete
</Button>

</div>

</div>

))}

</div>

{/* Bus Details */}
{selectedBus && (

<div className="bg-card border border-border rounded-lg p-6">

<h3 className="text-lg font-semibold mb-4">
Bus Details
</h3>

<div className="grid grid-cols-2 md:grid-cols-3 gap-4">

<div>
<p className="text-xs text-muted-foreground">Bus Number</p>
<p className="font-medium">{selectedBus.busNumber}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Registration</p>
<p className="font-medium">{selectedBus.registrationNumber}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Manufacturer</p>
<p className="font-medium">{selectedBus.manufacturer}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Model</p>
<p className="font-medium">{selectedBus.model}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Year</p>
<p className="font-medium">{selectedBus.year}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Capacity</p>
<p className="font-medium">{selectedBus.capacity}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Fuel Type</p>
<p className="font-medium">{selectedBus.fuelType}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Mileage</p>
<p className="font-medium">{selectedBus.mileage}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Status</p>
<p className="font-medium capitalize">{selectedBus.status}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Current Speed</p>
<p className="font-medium">{selectedBus.currentSpeed} km/h</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Occupancy</p>
<p className="font-medium">{selectedBus.currentOccupancy}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Current Status</p>
<p className="font-medium capitalize">{selectedBus.currentStatus}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Fuel</p>
<p className="font-medium">{selectedBus.fuelType}</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Features</p>
<p className="font-medium">
{selectedBus.features?.join(", ")}
</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Insurance Expiry</p>
<p className="font-medium">
{selectedBus.insuranceExpiry
? new Date(selectedBus.insuranceExpiry).toLocaleDateString()
: "-"}
</p>
</div>

<div>
<p className="text-xs text-muted-foreground">Permit Expiry</p>
<p className="font-medium">
{selectedBus.permitExpiry
? new Date(selectedBus.permitExpiry).toLocaleDateString()
: "-"}
</p>
</div>

</div>

{/* Action Buttons */}
<div className="flex gap-3 mt-6">

<Button
variant="outline"
onClick={()=>setShowEdit(true)}
>
Edit Bus
</Button>

<Button
variant="destructive"
onClick={()=>deleteBus(selectedBus._id)}
>
Delete Bus
</Button>

</div>

</div>

)}

{/* Add Modal */}
<AddBusModal
open={showAdd}
onClose={()=>setShowAdd(false)}
onBusAdded={fetchBuses}
/>

{/* Edit Modal */}
<EditBusModal
open={showEdit}
bus={selectedBus}
onClose={()=>setShowEdit(false)}
onUpdated={fetchBuses}
/>

</div>

);

};

export default BusManagementPanel;