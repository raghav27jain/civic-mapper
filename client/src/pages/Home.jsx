import ComplaintForm from "../components/ComplaintForm";
import MapView from "../components/MapView";

const Home = ({ complaints, loading, onComplaintSubmitted, user, onLoginClick }) => {
  return (
    <div className="main-layout">

      {/* Left panel — Complaint Form submission */}
      <div className="form-panel">
        <ComplaintForm 
          onComplaintSubmitted={onComplaintSubmitted} 
          user={user} 
          onLoginClick={onLoginClick}
        />
      </div>

      {/* Right panel — Live Leaflet Map */}
      <div className="map-panel">
        <MapView complaints={complaints} loading={loading} />
      </div>

    </div>
  );
};

export default Home;