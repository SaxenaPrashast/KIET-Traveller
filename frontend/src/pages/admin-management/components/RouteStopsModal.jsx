import React, { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { API_BASE } from "../../../config/constants";
import { useAuth } from "../../../contexts/AuthContext";

const RouteStopsModal = ({ routeId, open, onClose, onStopAdded }) => {

const { token } = useAuth();

const [formData, setFormData] = useState({
name:"",
address:"",
estimatedTime:""
});

const handleChange = (e)=>{
setFormData({
...formData,
[e.target.name]: e.target.value
});
};

const handleSubmit = async (e)=>{
    e.preventDefault();
    
    try{
    
    const payload = {
    name: formData.name,
    address: formData.address,
    estimatedTime: Number(formData.estimatedTime)
    };
    
    const res = await fetch(`${API_BASE}/routes/${routeId}/stops`,{
    method:"POST",
    headers:{
    "Content-Type":"application/json",
    Authorization:`Bearer ${token}`
    },
    body:JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if(!res.ok){
    throw new Error(data.message || "Failed to add stop");
    }
    
    if(onStopAdded) onStopAdded();
    
    onClose();
    
    }catch(err){
    
    console.error("Add stop error:",err);
    alert(err.message);
    
    }
    
    };

if(!open) return null;

return(

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

<div className="bg-card border border-border rounded-lg w-full max-w-md p-6">

<h2 className="text-lg font-semibold mb-4">
Add Route Stop
</h2>

<form onSubmit={handleSubmit} className="space-y-4">

<Input
label="Stop Name"
name="name"
value={formData.name}
onChange={handleChange}
required
/>

<Input
label="Address"
name="address"
value={formData.address}
onChange={handleChange}
required
/>

<Input
label="Time From Previous Stop (minutes)"
name="estimatedTime"
type="number"
value={formData.estimatedTime}
onChange={handleChange}
/>

<div className="flex justify-end gap-2 pt-4">

<Button variant="outline" onClick={onClose}>
Cancel
</Button>

<Button type="submit">
Add Stop
</Button>

</div>

</form>

</div>

</div>

);

};

export default RouteStopsModal;