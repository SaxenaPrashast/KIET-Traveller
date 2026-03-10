import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const AddBusModal = ({ open, onClose, onBusAdded }) => {

const { token } = useAuth();

const [form,setForm] = useState({
busNumber:"",
registrationNumber:"",
manufacturer:"",
model:"",
year:"",
capacity:"",
fuelType:"Diesel",
features:""
});

const handleChange = (e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};
const handleSubmit = async (e)=>{

    e.preventDefault();
    
    try{
    
    const payload = {
    busNumber: form.busNumber,
    registrationNumber: form.registrationNumber,
    manufacturer: form.manufacturer,
    model: form.model,
    year: Number(form.year),
    capacity: Number(form.capacity),
    fuelType: form.fuelType,
    features: form.features
    ? form.features.split(",").map(f => f.trim())
    : []
    };
    
    console.log("Payload:", payload);
    
    const res = await fetch(`${API_BASE}/buses`,{
    method:"POST",
    headers:{
    "Content-Type":"application/json",
    Authorization:`Bearer ${token}`
    },
    body:JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log(data);
    
    if(data.success){
    onBusAdded();
    onClose();
    }
    
    }catch(err){
    console.error("Create bus error:",err);
    }
    
    };

if(!open) return null;

return(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

<div className="bg-card border border-border rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">

<div className="p-6">

<h2 className="text-lg font-semibold mb-4 text-foreground">
Add Bus
</h2>

<form onSubmit={handleSubmit} className="space-y-4">

<Input
label="Bus Number"
name="busNumber"
value={form.busNumber}
onChange={handleChange}
required
/>

<Input
label="Registration Number"
name="registrationNumber"
value={form.registrationNumber}
onChange={handleChange}
required 
/>

<Input
label="Manufacturer"
name="manufacturer"
value={form.manufacturer}
onChange={handleChange}
required 
/>

<Input
label="Model"
name="model"
value={form.model}
onChange={handleChange}
required 
/>

<Input
label="Year"
name="year"
type="number"
value={form.year}
onChange={handleChange}
required 
/>

<Input
label="Capacity"
name="capacity"
type="number"
value={form.capacity}
onChange={handleChange}
required
/>

<Input
label="Fuel Type"
name="fuelType"
value={form.fuelType}
onChange={handleChange}
/>

<Input
label="Features (comma separated)"
name="features"
value={form.features}
onChange={handleChange}
placeholder="GPS, AC, CCTV"
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
Create Bus
</Button>

</div>

</form>

</div>

</div>

</div>

);

};

export default AddBusModal;