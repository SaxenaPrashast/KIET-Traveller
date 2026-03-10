import React, { useState, useEffect } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const EditBusModal = ({ open, onClose, bus, onUpdated }) => {

const { token } = useAuth();

const [form,setForm] = useState({
busNumber:"",
registrationNumber:"",
manufacturer:"",
model:"",
year:"",
capacity:"",
fuelType:"Diesel",
status:"active",
features:"",
insuranceExpiry:"",
permitExpiry:""
});

useEffect(()=>{

if(bus){
setForm({
busNumber: bus.busNumber || "",
registrationNumber: bus.registrationNumber || "",
manufacturer: bus.manufacturer || "",
model: bus.model || "",
year: bus.year || "",
capacity: bus.capacity || "",
fuelType: bus.fuelType || "Diesel",
status: bus.status || "active",
features: bus.features?.join(", ") || "",
insuranceExpiry: bus.insuranceExpiry?.substring(0,10) || "",
permitExpiry: bus.permitExpiry?.substring(0,10) || ""
});
}

},[bus]);

/* Prevent background scrolling */
useEffect(()=>{

if(open){
document.body.style.overflow = "hidden";
}else{
document.body.style.overflow = "auto";
}

return () => {
document.body.style.overflow = "auto";
};

},[open]);

const handleChange = (e)=>{
setForm({
...form,
[e.target.name]: e.target.value
});
};
const handleSubmit = async (e) => {

    e.preventDefault();
    
    try {
    
    const payload = {
    busNumber: form.busNumber,
    registrationNumber: form.registrationNumber,
    manufacturer: form.manufacturer,
    model: form.model,
    year: Number(form.year),
    capacity: Number(form.capacity),
    fuelType: form.fuelType,
    status: form.status
    };
    
    if(form.features){
    payload.features = form.features
    .split(",")
    .map(f => f.trim());
    }
    
    if(form.insuranceExpiry)
    payload.insuranceExpiry = form.insuranceExpiry;
    
    if(form.permitExpiry)
    payload.permitExpiry = form.permitExpiry;
    
    const res = await fetch(`${API_BASE}/buses/${bus._id}`, {
    method: "PUT",
    headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if(data.success){
    onUpdated();
    onClose();
    }else{
    console.error(data);
    }
    
    } catch(err){
    console.error("Update bus error:", err);
    }
    
    };

if(!open) return null;

return(

<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto pt-24 pb-10 px-4">

<div className="bg-card border border-border rounded-lg w-full max-w-xl shadow-xl relative">
    
<div className="p-6">

<h2 className="text-lg font-semibold mb-4">
Edit Bus
</h2>

<form onSubmit={handleSubmit} className="space-y-4">

<Input
label="Bus Number"
name="busNumber"
value={form.busNumber}
onChange={handleChange}
/>

<Input
label="Registration Number"
name="registrationNumber"
value={form.registrationNumber}
onChange={handleChange}
/>

<Input
label="Manufacturer"
name="manufacturer"
value={form.manufacturer}
onChange={handleChange}
/>

<Input
label="Model"
name="model"
value={form.model}
onChange={handleChange}
/>

<Input
label="Year"
name="year"
type="number"
value={form.year}
onChange={handleChange}
/>

<Input
label="Capacity"
name="capacity"
type="number"
value={form.capacity}
onChange={handleChange}
/>

<Input
label="Fuel Type"
name="fuelType"
value={form.fuelType}
onChange={handleChange}
/>

{/* Status Dropdown */}
<div>
<label className="block text-sm mb-1">Status</label>
<select
name="status"
value={form.status}
onChange={handleChange}
className="w-full bg-input border border-border rounded-md p-2"
>
<option value="active">Active</option>
<option value="inactive">Inactive</option>
<option value="maintenance">Maintenance</option>
<option value="retired">Retired</option>
</select>
</div>

<Input
label="Features (comma separated)"
name="features"
value={form.features}
onChange={handleChange}
/>

<Input
label="Insurance Expiry"
name="insuranceExpiry"
type="date"
value={form.insuranceExpiry}
onChange={handleChange}
/>

<Input
label="Permit Expiry"
name="permitExpiry"
type="date"
value={form.permitExpiry}
onChange={handleChange}
/>

<div className="flex justify-end gap-3 pt-4">

<Button
variant="outline"
type="button"
onClick={onClose}
>
Cancel
</Button>

<Button type="submit">
Update Bus
</Button>

</div>

</form>

</div>

</div>

</div>

);

};

export default EditBusModal;