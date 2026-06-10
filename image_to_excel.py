import os
import re
import pandas as pd
import pytesseract
from PIL import Image

# =====================================================================
# PREREQUISITES:
# 1. Install Tesseract OCR: https://github.com/UB-Mannheim/tesseract/wiki
# 2. Install Python packages: pip install pytesseract pandas pillow openpyxl
# =====================================================================

# Update this path if Tesseract is installed in a different location
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_details_from_text(text):
    """
    Parse the extracted text to find student details.
    You will need to adjust these regular expressions based on the actual
    format of your institute's ID cards or images.
    """
    details = {
        'Name': '',
        'Roll Number': '',
        'Course': '',
        'Email': '',
        'Phone': ''
    }
    
    # Example regex patterns (Modify these based on your image's format)
    name_match = re.search(r'Name[\s:]+([A-Za-z\s]+)', text, re.IGNORECASE)
    if name_match:
        details['Name'] = name_match.group(1).strip()
        
    roll_match = re.search(r'(?:Roll|ID)[\sA-Za-z]*[\s:]+(\w+)', text, re.IGNORECASE)
    if roll_match:
        details['Roll Number'] = roll_match.group(1).strip()
        
    course_match = re.search(r'Course[\s:]+([A-Za-z\s]+)', text, re.IGNORECASE)
    if course_match:
        details['Course'] = course_match.group(1).strip()
        
    email_match = re.search(r'Email[\s:]+([\w\.-]+@[\w\.-]+)', text, re.IGNORECASE)
    if email_match:
        details['Email'] = email_match.group(1).strip()
        
    phone_match = re.search(r'(?:Phone|Mobile)[\s:]+([\d\-\+]+)', text, re.IGNORECASE)
    if phone_match:
        details['Phone'] = phone_match.group(1).strip()
        
    return details

def process_images_to_excel(input_folder, output_excel_path):
    student_records = []
    
    # Supported image formats
    valid_extensions = ('.png', '.jpg', '.jpeg', '.tiff', '.bmp')
    
    if not os.path.exists(input_folder):
        print(f"Error: Input folder '{input_folder}' does not exist.")
        return
        
    for filename in os.listdir(input_folder):
        if filename.lower().endswith(valid_extensions):
            image_path = os.path.join(input_folder, filename)
            print(f"Processing: {filename}...")
            
            try:
                # Open image and extract text
                img = Image.open(image_path)
                text = pytesseract.image_to_string(img)
                
                # Parse details from text
                details = extract_details_from_text(text)
                
                # Add source filename for reference
                details['Source Image'] = filename
                
                student_records.append(details)
            except Exception as e:
                print(f"Failed to process {filename}: {e}")
                
    if student_records:
        # Convert to pandas DataFrame and save as Excel
        df = pd.DataFrame(student_records)
        
        # Reorder columns to put 'Source Image' first
        cols = ['Source Image', 'Name', 'Roll Number', 'Course', 'Email', 'Phone']
        df = df[cols]
        
        df.to_excel(output_excel_path, index=False)
        print(f"\nSuccessfully processed {len(student_records)} images.")
        print(f"Excel file saved to: {output_excel_path}")
    else:
        print("\nNo valid images found or extracted data was empty.")

if __name__ == "__main__":
    # --- Configuration ---
    # Put your images in this folder
    INPUT_FOLDER = "./student_images" 
    
    # The output Excel file name
    OUTPUT_EXCEL = "student_details.xlsx"
    
    # Create the input folder if it doesn't exist
    if not os.path.exists(INPUT_FOLDER):
        os.makedirs(INPUT_FOLDER)
        print(f"Created folder '{INPUT_FOLDER}'. Please place your images inside it and run the script again.")
    else:
        process_images_to_excel(INPUT_FOLDER, OUTPUT_EXCEL)
