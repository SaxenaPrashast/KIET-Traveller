import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const AssignBusModal = ({ routeId, open, onClose, onAssigned }) => {

const { token } = useAuth();

const [buses,setBuses] = useState([]);
const [selectedBus,setSelectedBus] = useState("");

useEffect(()=>{

const fetchBuses = async ()=>{

try{

const res = await fetch(`${API_BASE}/buses`,{
headers:{ Authorization:`Bearer ${token}` }
});

const data = await res.json();

if(data.success){
setBuses(data.data.buses);
}

}catch(err){
console.error("Bus fetch error:",err);
}

};

if(open){
fetchBuses();
}

},[open]);

const handleAssign = async ()=>{
console.log("Assign clicked");
console.log("Route:", routeId);
console.log("Bus:", selectedBus);

if(!selectedBus){
alert("Please select a bus");
return;
}

try{

const res = await fetch(`${API_BASE}/routes/${routeId}/assign-bus`,{
method:"PUT",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({ busId:selectedBus })
});

const data = await res.json();

if(!res.ok){
throw new Error(data.message);
}

if(onAssigned) onAssigned();

onClose();

}catch(err){

console.error("Assign bus error:",err);
alert(err.message);

}

};

if(!open) return null;

return(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

<div className="bg-card border border-border rounded-lg w-full max-w-md p-6">

<h2 className="text-lg font-semibold mb-4">
Assign Bus
</h2>

<select
className="w-full p-2 border border-border bg-background text-foreground rounded-md"
value={selectedBus}
onChange={(e)=>setSelectedBus(e.target.value)}
>

<option value="">Select Bus</option>

{buses.map(bus=>(
<option key={bus._id} value={bus._id}>
{bus.busNumber}
</option>
))}

</select>

<div className="flex justify-end gap-2 mt-4">

<Button variant="outline" onClick={onClose}>
Cancel
</Button>

<Button type="button" onClick={handleAssign}>
Assign
</Button>

</div>

</div>

</div>

);

};

export default AssignBusModal;