import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import RequestForResetPass from "./pages/AuthPages/RequestForResetPass";
import ResetPass from "./pages/AuthPages/ResetPass";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Roles from "./pages/userroles/Roles";
import CreateRole from "./pages/userroles/CreateRole";
import EditRole from "./pages/userroles/EditRole";
import Users from "./pages/users/Users";
import CreateUser from "./pages/users/CreateUser";
import EditUser from "./pages/users/EditUser";
import UserLogs from "./pages/userlogs/UserLogs";
import { ReactNode } from "react";
import  HomePage from './pages/HomePage'
import AddAbout from './pages/about/AddAbout'
import About from './pages/about/About'
import EditAbout from './pages/about/EditAbout'
import AddCompHome  from './pages/company/AddCompHome'
import CompHome from  './pages/company/CompHome'
import EditCompHome  from './pages/company/EditCompHome'
import CompLayout  from './pages/CompLayout'
import AddMCLHome   from './pages/company/mcl-group/AddMCLHome '
import EditMCLHome  from './pages/company/mcl-group/EditMCLHome'
import ViewMCLHome  from './pages/company/mcl-group/ViewMCLHome'
import MCLgroup  from './pages/company/mcl-group/MCLgroup'
import EditMCLgroup  from './pages/company/mcl-group/EditMCLgroup'
import AddMCLgroup  from './pages/company/mcl-group/AddMCLgroup'
import FtHomeLayout  from  './pages/MCLHomeLayout'
import  AddLeadershipHome from './pages/leadership/AddLeadershipHome'
import  EditLeadershipHome from './pages/leadership/EditLeadershipHome'
import  LeadershipHome  from  './pages/leadership/LeadershipHome'
import LeadershipHomeLayout from './pages/LeadershipHomeLayout'
import  DiversityHome  from './pages/diversities/DiversityHome'
import AddDiversityHome  from './pages/diversities/AddDiversityHome'
import  EditDiversityHome from './pages/diversities/EditDiversityHome'
import  DiversityAndInclusionLayout  from  './pages/DiversityAndInclusionLayout'
import Leadership  from './pages/leadership/Leadership'
import  AddLeadership  from './pages/leadership/AddLeadership'
import  EditLeadership from './pages/leadership/EditLeadership'
import  SustainabilityHome  from './pages/sustainability/SustainabilityHome'
import  AddSustainabilityHome  from './pages/sustainability/AddSustainabilityHome'
import  EditSustainabilityHome from './pages/sustainability/EditSustainabilityHome'
import SustainabilityLayout  from './pages/SustainabilityLayout'
import  Sustainability  from './pages/sustainability/Sustainability'
import  AddSustainability  from './pages/sustainability/AddSustainability'
import  EditSustainability  from './pages/sustainability/EditSustainability'
import ViewGivingHome from './pages/givingback/ViewGivingHome'
import AddGivingHome   from  './pages/givingback/AddGivingHome'
import EditGivingHome  from  './pages/givingback/EditGivingHome'
import  GivingBackLayout  from './pages/GivingBackLayout'
import  GivingBack  from './pages/givingback/GivingBack'
import  AddGivingBack  from  './pages/givingback/AddGivingBack' 
import EditGivingBack  from  './pages/givingback/EditGivingBack'
import AddFtPink130Home from './pages/pink130/AddPink130Home'
import  EditFtPink130Home from  './pages/pink130/EditPink130Home'
import  ViewFtPink130Home  from './pages/pink130/ViewPink130Home'
import AddPink130 from './pages/pink130/AddPink130'
import Pink130  from  './pages/pink130/Pink130'
import  EditPink130   from './pages/pink130/EditPink130'


// Define props for ProtectedRoute
interface ProtectedRouteProps {
  children: ReactNode;
}

// ProtectedRoute component to mimic Vue's navigation guard
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");

  // Check if the route requires authentication and if token exists
  if (!token) {
    // Redirect to the sign-in page if no token
    return <Navigate to="/sign-in" replace />;
  }

  // If authenticated, render the children (protected content)
  return children;
};

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout with Protected Routes */}
          <Route element={<AppLayout />}>
            <Route
              index
              path="/dashboard"
              element={
                <ProtectedRoute>
                     <Home />
                </ProtectedRoute>
              }
            />

            {/* Others Page */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfiles />
                </ProtectedRoute>
              }
            />
             <Route
              path="/user-roles"
              element={
                <ProtectedRoute>
                  <Roles />
                </ProtectedRoute>
              }
            />
                  
                  <Route
  path="/edit-role/:roleId"
  element={
    <ProtectedRoute>
      <EditRole />
    </ProtectedRoute>
  }
/>

          
            <Route
              path="/create-role"
              element={
                <ProtectedRoute>
                  <CreateRole />
                </ProtectedRoute>
              }
            />


<Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users   />
                </ProtectedRoute>
              }
            />


<Route
              path="/create-user"
              element={
                <ProtectedRoute>
                  <CreateUser />
                </ProtectedRoute>
              }
            />

<Route
  path="/edit-user/:userId"
  element={
    <ProtectedRoute>
      <EditUser />
    </ProtectedRoute>
  }
/>

<Route
  path="/user-logs"
  element={
    <ProtectedRoute>
      <UserLogs />
    </ProtectedRoute>
  }

/>

<Route
  path="/add/about"
  element={
    <ProtectedRoute>
      <AddAbout />
    </ProtectedRoute>
  }

/>

<Route
  path="/about"
  element={
    <ProtectedRoute>
      <About />
    </ProtectedRoute>
  }

/>

<Route
  path="/edit-about/:aboutId"
  element={
    <ProtectedRoute>
      <EditAbout />
    </ProtectedRoute>
  }
/>



<Route
  path="/add/company/home"
  element={
    <ProtectedRoute>
      <AddCompHome />
    </ProtectedRoute>
  }

/>

<Route
  path="/company"
  element={
    <ProtectedRoute>
      <CompHome />
    </ProtectedRoute>
  }

/>

<Route
  path="/edit-company/:companyId"
  element={
    <ProtectedRoute>
      <EditCompHome />
    </ProtectedRoute>
  }
/>


<Route path="/mcl-group/home" element={<ProtectedRoute><ViewMCLHome /></ProtectedRoute>} />
<Route path="/add/mcl-home" element={<ProtectedRoute><AddMCLHome /></ProtectedRoute>} />
<Route path="/edit-mcl-home/:mcl_homeId" element={<ProtectedRoute><EditMCLHome /></ProtectedRoute>} />

<Route
  path="/add/mcl-group"
  element={
    <ProtectedRoute>
      <AddMCLgroup />
    </ProtectedRoute>
  }

/>

<Route
  path="/mcl-group"
  element={
    <ProtectedRoute>
      <MCLgroup />
    </ProtectedRoute>
  }

/>

 <Route
    path="/mcl-groups/edit/:mcl_groupId" // The key is `:mcl_groupId`
    element={
      <ProtectedRoute>
        <EditMCLgroup />
      </ProtectedRoute>
    }
  />

<Route
  path="/add/leadership/home"
  element={
    <ProtectedRoute>
      <AddLeadershipHome />
    </ProtectedRoute>
  }
/>

<Route
  path="/leadership/home"
  element={
    <ProtectedRoute>
      <LeadershipHome />
    </ProtectedRoute>
  }
/>

<Route
  path="/edit/leadership/home/:leadership_home_id"
  element={
    <ProtectedRoute>
      <EditLeadershipHome />
    </ProtectedRoute>
  }
/>


<Route
      path="/add/sustainability/home"
      element={
        <ProtectedRoute>
          <AddSustainabilityHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/sustainability/home"
      element={
        <ProtectedRoute>
          <SustainabilityHome />
        </ProtectedRoute>
      }
    />
    <Route
      path="/edit/sustainability/home/:sustainability_home_id"
      element={
        <ProtectedRoute>
          <EditSustainabilityHome />
        </ProtectedRoute>
      }
    />

<Route path="/sustainability" element={<ProtectedRoute><Sustainability /></ProtectedRoute>} />
<Route path="/add/sustainability" element={<ProtectedRoute><AddSustainability /></ProtectedRoute>} />
<Route path="/edit-sustainability/:sustainabilityId" element={<ProtectedRoute><EditSustainability /></ProtectedRoute>} />

<Route path="/leadership" element={<ProtectedRoute><Leadership /></ProtectedRoute>} />
<Route path="/add/leadership" element={<ProtectedRoute><AddLeadership /></ProtectedRoute>} />
<Route path="/edit-leadership/:leadershipId" element={<ProtectedRoute><EditLeadership /></ProtectedRoute>} />

<Route path="/diversity-and-inclusion" element={<ProtectedRoute><DiversityHome/></ProtectedRoute>} />
<Route path="/add/diversity-and-inclusion" element={<ProtectedRoute><AddDiversityHome /></ProtectedRoute>} />
<Route path="/edit-diversity-home/:dhomeId" element={<ProtectedRoute><EditDiversityHome /></ProtectedRoute>} />



<Route path="/giving-back" element={<ProtectedRoute><ViewGivingHome /></ProtectedRoute>} />
<Route path="/add/giving-back" element={<ProtectedRoute><AddGivingHome /></ProtectedRoute>} />
<Route path="/edit-giving-back/:giving_backId" element={<ProtectedRoute><EditGivingHome /></ProtectedRoute>} />


 <Route path="/giving/back" element={<ProtectedRoute><GivingBack /></ProtectedRoute>} />
 <Route path="/add/giving/back" element={<ProtectedRoute><AddGivingBack /></ProtectedRoute>} />
 <Route path="/edit-giving/back/:givingId" element={<ProtectedRoute><EditGivingBack /></ProtectedRoute>} />



<Route path="/pink-130" element={<ProtectedRoute><Pink130 /></ProtectedRoute>} />
<Route path="/add/pink-130" element={<ProtectedRoute><AddPink130 /></ProtectedRoute>} />
<Route path="/edit-pink-130/:pinkId" element={<ProtectedRoute><EditPink130 /></ProtectedRoute>} />
          
          
          <Route
            path="/add/mcl-pink-130-home"
            element={
              <ProtectedRoute>
                <AddFtPink130Home
              />
            </ProtectedRoute>
            }
            />
          <Route
            path="/edit-mcl-pink-130-home/:ft_pink_id"
            element={
              <ProtectedRoute>
                <EditFtPink130Home />
              </ProtectedRoute>
            }
            />
            <Route
              path="/mcl-pink-130-home"
              element={
                <ProtectedRoute>
                  <ViewFtPink130Home />
                </ProtectedRoute>
              }
            />


            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/blank"
              element={
                <ProtectedRoute>
                  <Blank />
                </ProtectedRoute>
              }
            />

            {/* Forms */}
            <Route
              path="/form-elements"
              element={
                <ProtectedRoute>
                  <FormElements />
                </ProtectedRoute>
              }
            />

            {/* Tables */}
            <Route
              path="/basic-tables"
              element={
                <ProtectedRoute>
                  <BasicTables />
                </ProtectedRoute>
              }
            />

            {/* Ui Elements */}
            <Route
              path="/alerts"
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/avatars"
              element={
                <ProtectedRoute>
                  <Avatars />
                </ProtectedRoute>
              }
            />
            <Route
              path="/badge"
              element={
                <ProtectedRoute>
                  <Badges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buttons"
              element={
                <ProtectedRoute>
                  <Buttons />
                </ProtectedRoute>
              }
            />
            <Route
              path="/images"
              element={
                <ProtectedRoute>
                  <Images />
                </ProtectedRoute>
              }
            />
            <Route
              path="/videos"
              element={
                <ProtectedRoute>
                  <Videos />
                </ProtectedRoute>
              }
            />

            {/* Charts */}
            <Route
              path="/line-chart"
              element={
                <ProtectedRoute>
                  <LineChart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bar-chart"
              element={
                <ProtectedRoute>
                  <BarChart />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Public Routes - Auth Layout */}
          <Route path="/" element={<HomePage />} />
         <Route path="/company/home" element={<CompLayout />} />
         <Route path="/company/mcl-group" element={<FtHomeLayout />} />
         <Route path="/company/leadership" element={<LeadershipHomeLayout />} />
        <Route path="/company/diversity-and-inclusion" element={< DiversityAndInclusionLayout />} />
        <Route path="/company/sustainability" element={< SustainabilityLayout />} />
         <Route path="/company/giving-back" element={< GivingBackLayout />} />
         
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPass />} />
          <Route path="/request-for/reset-password" element={<RequestForResetPass/>} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />

          
        </Routes>
      </Router>
    </>
  );
}