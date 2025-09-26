# Troubleshooting Guide

## Common Issues and Solutions

### 1. Login Problems

#### Issue: Cannot access admin panel
**Solutions:**
- Clear browser cache and cookies
- Try private/incognito mode
- Check browser console for errors (F12)
- Verify you're at correct URL: `/admin/login`

#### Issue: First-run setup not appearing
**Solutions:**
- Clear all localStorage
- Close all browser tabs
- Reopen browser and navigate to `/admin/login`
- Check if `admin_setup_complete` exists in localStorage and remove it

#### Issue: Invalid credentials error
**Solutions:**
- Verify email and password
- Password is case-sensitive
- Try password reset if available
- Check if first-run setup was completed

### 2. Media Upload Issues

#### Issue: Image upload fails
**Error Messages:**
- "File too large"
- "Invalid dimensions"
- "Unsupported file type"

**Solutions:**
- **Hero Images**: Must be 2000×1333px, under 1.5MB
- **Gallery Images**: Must be 1600×1066px, under 1MB
- **File Types**: Only JPG, PNG, WebP supported
- Compress images before upload
- Check file extension matches actual type

#### Issue: Media not displaying
**Solutions:**
- Refresh the page
- Check browser console for errors
- Verify image was uploaded successfully
- Clear browser cache

#### Issue: Slow media loading
**Solutions:**
- Reduce number of images per page
- Optimize images before upload
- Clear unused media from library
- Check internet connection

### 3. Content Management Issues

#### Issue: Changes not saving
**Solutions:**
- Check all required fields are filled
- Look for error messages (usually in red)
- Verify file permissions in browser
- Try saving again
- Refresh page and retry

#### Issue: Content not appearing on live site
**Solutions:**
- Remember to publish changes
- Check if in draft mode
- Verify publish completed successfully
- Clear browser cache

#### Issue: Slug already in use error
**Solutions:**
- System will auto-generate unique slug
- Or manually enter a different slug
- Slugs must be unique per content type

### 4. Enquiry Management Issues

#### Issue: New enquiries not appearing
**Solutions:**
- Refresh the page
- Check if enquiry was saved correctly
- Verify you're looking at correct status filter
- Check browser console for errors

#### Issue: Status not updating
**Solutions:**
- Click save after changing status
- Check for error messages
- Refresh page and try again
- Verify you have permission

#### Issue: Reference code format wrong
**Solutions:**
- Format is auto-generated: ENQ-YYYY-NNNN
- Cannot be manually edited
- Check system date/time settings

### 5. Export/Import Issues

#### Issue: Export fails
**Solutions:**
- Check browser storage space
- Try exporting without media
- Close other tabs to free memory
- Use different browser

#### Issue: Import fails validation
**Solutions:**
- Verify export file is not corrupted
- Check schema version (must be 1.0.0)
- Ensure file was exported from same system
- Try re-exporting

#### Issue: Import preview shows no changes
**Solutions:**
- This is normal if no changes detected
- Check if importing into empty system
- Verify you're importing correct file

### 6. Performance Issues

#### Issue: Site is slow
**Solutions:**
- Clear browser cache
- Remove unused media files
- Archive old enquiries
- Close unused browser tabs
- Check browser task manager for memory usage

#### Issue: Page crashes
**Solutions:**
- Large media files can cause crashes
- Avoid uploading many files at once
- Keep image sizes optimized
- Use modern browser

#### Issue: Forms are unresponsive
**Solutions:**
- Wait for large media to process
- Check browser console for errors
- Refresh page and try again
- Clear browser data

### 7. Browser-Specific Issues

#### Chrome/Edge
- Generally works well
- Check for extension conflicts
- Update to latest version

#### Firefox
- May have different file size limits
- Check privacy settings
- Enable localStorage

#### Safari
- Strict file type checking
- Private mode may block localStorage
- Check "Prevent cross-site tracking"

#### Mobile Browsers
- Some features limited
- Upload may be slower
- Use desktop for best experience

### 8. Data Loss Prevention

#### Regular Backups
1. Go to Export/Import
2. Export data regularly
3. Keep backup files safe
4. Export before major changes

#### Browser Data Management
- Don't clear localStorage unless necessary
- Export before clearing browser data
- Use browser sync if available

#### Multiple Device Usage
- System designed for single device
- Export/import to transfer between devices
- Don't use simultaneously on multiple devices

### 9. Error Messages Reference

#### Common Error Messages

```
"Failed to load media"
```
- Check file was uploaded correctly
- Verify file exists in storage
- Refresh page

```
"Validation failed"
```
- Check all required fields
- Look for specific error messages
- Verify data formats

```
"Network error"
```
- Check internet connection
- Try different browser
- Check CORS settings

```
"Storage quota exceeded"
```
- Clear unused media
- Export and delete old data
- Use browser with more storage

### 10. Getting Help

#### Before Contacting Support
1. Check this guide
2. Search existing issues
3. Try basic troubleshooting
4. Gather error details

#### Information to Provide
- Browser and version
- Exact error message
- Steps to reproduce
- Screenshots if helpful
- Console errors (F12)

#### Emergency Recovery
If system becomes unusable:
1. Export any remaining data
2. Clear all browser data
3. Re-run first-run setup
4. Import backup data

---

**Remember**: This is a local-only system. Keep regular backups and don't clear browser data without exporting first!