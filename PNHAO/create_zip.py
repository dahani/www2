import os
import zipfile

def create_zip():
    zip_filename = 'public/pnhao.zip'
    
    # Ensure public folder exists
    os.makedirs('public', exist_ok=True)
    
    # Files/directories to exclude
    exclude_dirs = {
        'node_modules', 
        'dist', 
        '.git', 
        '.aistudio',
        '__pycache__'
    }
    exclude_files = {
        'create_zip.py',
        'pnhao.zip',
        'audit_images.cjs',
        'audit_small_files.cjs',
        'find_all_small_files.cjs',
        'probe.cjs',
        'probe.py',
        'verify_references.cjs',
        'test_download.cjs'
    }

    print(f"Creating {zip_filename}...")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Exclude directories in-place so os.walk doesn't visit them
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file in exclude_files:
                    continue
                
                # Construct path relative to workspace root
                file_path = os.path.join(root, file)
                archive_name = os.path.relpath(file_path, '.')
                
                # Avoid adding public/pnhao.zip inside itself
                if archive_name == 'public/pnhao.zip':
                    continue
                
                # Check file size (optional print)
                file_size = os.path.getsize(file_path)
                print(f"Adding: {archive_name} ({file_size} bytes)")
                
                zipf.write(file_path, archive_name)
                
    print(f"\nSuccessfully created {zip_filename} containing all updated project files, logos, and images!")

if __name__ == '__main__':
    create_zip()
