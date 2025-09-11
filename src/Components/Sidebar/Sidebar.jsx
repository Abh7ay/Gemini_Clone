import React, { useState } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);

  return (
    <div className="sidebar">
      <div className="Top">
        <img onClick={()=>setExtended(prev=>!prev)} className="menu" src={assets.menu_icon} alt="" />
        <div className="new-chat" onClick={() => window.dispatchEvent(new Event('new-chat'))}>
          <img src={assets.plus_icon} alt="" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className="recent">
            <p className="recent-title">Recent</p>
            <div className="recent-entry" onClick={() => window.dispatchEvent(new CustomEvent('recent-click', { detail: { prompt: 'What is React?' } }))}>
              <img src={assets.message_icon} alt="" />
              <p>What is React ... </p>
            </div>
          </div>
        ) : null}
      </div>
      <div className="Bottom">
        <div className="bottom-item recent-entry" onClick={() => window.dispatchEvent(new Event('open-help'))}>
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-item recent-entry" onClick={() => window.dispatchEvent(new Event('open-activity'))}>
          <img src={assets.history_icon} alt="" />
          {extended ? <p>Activity</p> : null}
        </div>
        <div className="bottom-item recent-entry" onClick={() => window.dispatchEvent(new Event('open-settings'))}>
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
