import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getByIdProposal } from "../../../services/api";
function Detail() {
  const { id } = useParams();
  const [proposal, setProposal] = useState();

  useEffect(() => {
    fetchDataDetails();
  }, []);

  console.log(proposal);

  const fetchDataDetails = async () => {
    const res = await getByIdProposal(id);
    setProposal(res);
  };

  return <div>index</div>;
}

export default Detail;
