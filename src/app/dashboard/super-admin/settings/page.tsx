'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'EZZA',
    footerText: '© 2025 Tous droits réservés.',
    contactEmail: 'contact@venusima.com',
    socialLinks: {
      facebook: '',
      instagram: ''
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name.startsWith('socialLinks.')) {
      const platform = name.split('.')[1]
      setSettings((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }))
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paramètres du site</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom du site</label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Texte du pied de page</label>
          <input
            type="text"
            name="footerText"
            value={settings.footerText}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email de contact</label>
          <input
            type="email"
            name="contactEmail"
            value={settings.contactEmail}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lien Facebook</label>
          <input
            type="text"
            name="socialLinks.facebook"
            value={settings.socialLinks.facebook}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lien Instagram</label>
          <input
            type="text"
            name="socialLinks.instagram"
            value={settings.socialLinks.instagram}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
      </div>

      
    </div>
  )
}
