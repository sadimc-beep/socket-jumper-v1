import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rfqs.models import VehicleMake, VehicleModel, VehicleYear, VehicleEngine
from django.db import transaction

# Data Structure:
# Make -> { ModelName (Code): { "years": [start, end], "engines": ["Engine1", "Engine2"] } }
# Note: Year range is inclusive.

JDM_DATA = {
    "Toyota": {
        # Sedans
        "Allion (NZT240/AZT240)": { 
            "years": [2001, 2007], 
            "engines": ["1NZ-FE", "1AZ-FSE", "1ZZ-FE"] 
        },
        "Allion (NZT260/ZRT260)": { 
            "years": [2007, 2021], 
            "engines": ["1NZ-FE", "2ZR-FE", "3ZR-FAE"] 
        },
        "Premio (NZT240/ZZT240)": { 
            "years": [2001, 2007], 
            "engines": ["1NZ-FE", "1ZZ-FE", "1AZ-FSE"] 
        },
        "Premio (NZT260/ZRT260)": { 
            "years": [2007, 2021], 
            "engines": ["1NZ-FE", "2ZR-FE", "3ZR-FAE"] 
        },
        "Corolla Axio (NZE141)": { 
            "years": [2006, 2012], 
            "engines": ["1NZ-FE", "2ZR-FE"] 
        },
        "Corolla Axio (NZE161/NRE161)": { 
            "years": [2012, 2024], 
            "engines": ["1NZ-FE", "2NR-FKE", "1NZ-FXE (Hybrid)"] 
        },
        "Corolla Fielder (NZE141)": { 
            "years": [2006, 2012], 
            "engines": ["1NZ-FE", "2ZR-FE"] 
        },
        "Corolla Fielder (NZE161/NKE165)": { 
            "years": [2012, 2024], 
            "engines": ["1NZ-FE", "2NR-FKE", "1NZ-FXE (Hybrid)"] 
        },
        "Crown (GRS180 - Zero Crown)": {
            "years": [2003, 2008],
            "engines": ["4GR-FSE", "3GR-FSE"]
        },
        "Crown (GRS200)": {
            "years": [2008, 2012],
            "engines": ["4GR-FSE", "3GR-FSE", "2GR-FSE"]
        },
        "Crown (AWS210)": {
            "years": [2012, 2018],
            "engines": ["2AR-FSE (Hybrid)", "4GR-FSE", "8AR-FTS"]
        },
        "Mark X (GRX120)": {
            "years": [2004, 2009],
            "engines": ["4GR-FSE", "3GR-FSE"]
        },
        "Mark X (GRX130)": {
            "years": [2009, 2019],
            "engines": ["4GR-FSE", "2GR-FSE"]
        },
        "Prius (ZVW30)": {
            "years": [2009, 2015],
            "engines": ["2ZR-FXE"]
        },
        "Prius (ZVW50)": {
            "years": [2015, 2022],
            "engines": ["2ZR-FXE"]
        },
        "Aqua (NHP10)": {
            "years": [2011, 2021],
            "engines": ["1NZ-FXE"]
        },
        
        # SUVs / Vans
        "Harrier (ACU30/MCU30)": {
            "years": [2003, 2013],
            "engines": ["2AZ-FE", "1MZ-FE", "3MZ-FE"]
        },
        "Harrier (ZSU60/AVU65)": {
            "years": [2013, 2020],
            "engines": ["3ZR-FAE", "2AR-FXE (Hybrid)", "8AR-FTS"]
        },
        "Land Cruiser Prado (TRJ120)": {
            "years": [2002, 2009],
            "engines": ["2TR-FE", "1GR-FE", "1KZ-TE"]
        },
        "Land Cruiser Prado (TRJ150)": {
            "years": [2009, 2024],
            "engines": ["2TR-FE", "1GR-FE", "1GD-FTV (Diesel)"]
        },
        "Noah (AZR60)": {
            "years": [2001, 2007],
            "engines": ["1AZ-FSE"]
        },
        "Noah (ZRR70)": {
            "years": [2007, 2014],
            "engines": ["3ZR-FE", "3ZR-FAE"]
        },
        "Noah (ZRR80/ZWR80)": {
            "years": [2014, 2021],
            "engines": ["3ZR-FAE", "2ZR-FXE (Hybrid)"]
        },
        "Voxy (AZR60)": { "years": [2001, 2007], "engines": ["1AZ-FSE"] },
        "Voxy (ZRR70)": { "years": [2007, 2014], "engines": ["3ZR-FE", "3ZR-FAE"] },
        "Voxy (ZRR80)": { "years": [2014, 2021], "engines": ["3ZR-FAE", "2ZR-FXE"] },
        
        "Hiace (TRH200)": {
            "years": [2004, 2024],
            "engines": ["1TR-FE", "2TR-FE", "1KD-FTV", "1GD-FTV"]
        },
        "Probox/Succeed (NCP50)": { "years": [2002, 2014], "engines": ["1NZ-FE", "2NZ-FE"] },
        "Probox (NCP160)": { "years": [2014, 2024], "engines": ["1NZ-FE", "1NZ-FXE"] },
    },
    
    "Honda": {
        "Civic (FD)": { "years": [2005, 2011], "engines": ["R18A", "K20A"] },
        "Civic (FC/FK)": { "years": [2015, 2021], "engines": ["L15B7 (Turbo)", "R18Z1"] },
        "Vezel (RU1/RU2)": { "years": [2013, 2021], "engines": ["L15B"] },
        "Vezel Hybrid (RU3/RU4)": { "years": [2013, 2021], "engines": ["LEB-H1"] },
        "Fit (GE)": { "years": [2007, 2013], "engines": ["L13A", "L15A"] },
        "Fit (GK/GP5)": { "years": [2013, 2020], "engines": ["L13B", "L15B", "LEB (Hybrid)"] },
        "Grace (GM4/5/6/9)": { "years": [2014, 2020], "engines": ["L15B", "LEB (Hybrid)"] },
        "CR-V (RE)": { "years": [2006, 2011], "engines": ["R20A", "K24Z"] },
        "CR-V (RM)": { "years": [2011, 2016], "engines": ["R20A", "K24Z"] },
        "CR-V (RW)": { "years": [2016, 2022], "engines": ["L15B7 (Turbo)", "2.0 Hybrid"] },
        "Airwave": { "years": [2005, 2010], "engines": ["L15A"] },
    },
    
    "Nissan": {
        "X-Trail (T30)": { "years": [2000, 2007], "engines": ["QR20DE", "QR25DE"] },
        "X-Trail (T31)": { "years": [2007, 2013], "engines": ["MR20DE", "QR25DE", "M9R (Diesel)"] },
        "X-Trail (T32)": { "years": [2013, 2022], "engines": ["MR20DD", "QR25DE", "MR20DD Hybrid"] },
        "Bluebird Sylphy (G11)": { "years": [2005, 2012], "engines": ["HR15DE", "MR20DE"] },
        "Sylphy (B17)": { "years": [2012, 2020], "engines": ["MRA8DE"] },
        "Juke (F15)": { "years": [2010, 2019], "engines": ["HR15DE", "MR16DDT"] },
        "Tiida (C11)": { "years": [2004, 2012], "engines": ["HR15DE", "MR18DE"] },
    },
    
    "Mitsubishi": {
        "Outlander (CW/ZG)": { "years": [2006, 2012], "engines": ["4B11", "4B12", "6B31"] },
        "Outlander (GF/GG - PHEV)": { "years": [2012, 2021], "engines": ["4B11", "4B12", "4J11", "4B12 (PHEV)"] },
        "Lancer EX (CY)": { "years": [2007, 2017], "engines": ["4A91", "4B10", "4B11"] },
        "Pajero (V80/V90)": { "years": [2006, 2021], "engines": ["6G72", "4M41 (Diesel)", "6G75"] },
    }
}

def run():
    print("WARNING: This script will WIPE all existing vehicle data.")
    # Removed interactive input for automation
    
    with transaction.atomic():
        print("Deleting existing data...")
        VehicleMake.objects.all().delete()
        
        print("Starting Detailed JDM Data Population...")
        
        for make_name, models_data in JDM_DATA.items():
            make = VehicleMake.objects.create(name=make_name)
            print(f"Created Make: {make_name}")
            
            for model_name, info in models_data.items():
                model = VehicleModel.objects.create(make=make, name=model_name)
                
                # Populate Engines
                for engine_name in info.get("engines", []):
                    VehicleEngine.objects.create(model=model, name=engine_name)
                
                # Populate Years
                start_year, end_year = info.get("years", [2000, 2000])
                for year in range(start_year, end_year + 1):
                    VehicleYear.objects.create(model=model, year=year)
                    
                print(f"  Created Model: {model_name} ({len(info.get('engines'))} engines, {end_year-start_year+1} years)")
                
    print("Successfully populated JDM data!")

if __name__ == "__main__":
    run()
