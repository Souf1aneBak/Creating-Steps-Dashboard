'use client'

import { useState, useEffect } from 'react'
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa"
import Image from "next/image"

export default function Footer() {
  const [settings, setSettings] = useState<any>(null)
   const backendUrl = 'http://localhost:3001';
  useEffect(() => {
    fetch('http://localhost:3001/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
  }, [])

  if (!settings) return null // Wait until settings is loaded

  // Now settings is guaranteed not null here
  const logoSrc = settings.logoUrl
    ? `${backendUrl}${settings.logoUrl}?t=${Date.now()}` // e.g. http://localhost:3001/uploads/logo_1234.jpg
    : '/ezza.jpg';

  return (
    <footer className="bg-gray-900 text-white pt-8 pb-4 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">

        {/* Left: Logo & About */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt="Current logo" className="mt-2 h-16" />

            <span className="font-semibold text-lg">{settings.siteName}</span>
          </div>
          <p className="text-gray-400 max-w-xs">
            {settings.footerText || "Créativité et innovation au service de vos idées."}
          </p>
        </div>

        {/* Middle: Contact Info */}
        <div className="flex flex-col items-center space-y-2">
          {settings.phone && (
            <div className="flex items-center gap-2">
              <FaPhone /> {settings.phone}
            </div>
          )}
          {settings.contactEmail && (
            <div className="flex items-center gap-2">
              <FaEnvelope />
              <a href={`mailto:${settings.contactEmail}`} className="hover:underline">{settings.contactEmail}</a>
            </div>
          )}
          {settings.address && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt /> {settings.address}
            </div>
          )}
        </div>

        {/* Right: Social Links */}
        <div className="flex flex-col items-center md:items-end space-y-3">
          <h3 className="font-semibold">Suivez-nous</h3>
          <div className="flex gap-4 text-xl">
            {settings.socialLinks.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400"><FaFacebook /></a>}
            {settings.socialLinks.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400"><FaInstagram /></a>}
            {settings.socialLinks.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300"><FaTwitter /></a>}
            {settings.socialLinks.linkedin && <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><FaLinkedin /></a>}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-6 pt-3 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} {settings.siteName}. Tous droits réservés.
      </div>
    </footer>
  )
}
