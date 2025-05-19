'use client'

import { useState, useEffect } from 'react'
import { FileNode } from '@/types/file_explorer/file-structure'

const STORAGE_KEY = 'recentFiles'
const MAX_FILES = 20

export function useRecentFiles() {
  const [recentFiles, setRecentFiles] = useState<FileNode[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setRecentFiles(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load recent files', err)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentFiles))
    } catch (err) {
      console.error('Failed to save recent files', err)
    }
  }, [recentFiles])

  const addFile = (file: FileNode) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(f => f.id !== file.id)
      const updated = [file, ...filtered]
      return updated.slice(0, MAX_FILES)
    })
  }

  const clearFiles = () => setRecentFiles([])

  return { recentFiles, addFile, clearFiles }
}
