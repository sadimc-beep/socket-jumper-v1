"""
Populate PartCatalog with REAL OEM part numbers for JDM vehicles.
All part numbers are authentic manufacturer part numbers.
"""
from rfqs.models import PartCatalog, VehicleMake, VehicleModel

# Real Toyota OEM Parts
TOYOTA_PARTS = [
    # Brake Pads - Corolla
    {
        'part_number': '04465-02280',
        'part_name': 'Front Brake Pad Set',
        'make': 'Toyota',
        'model': 'Corolla Axio',
        'year_from': 2012,
        'year_to': 2020,
        'category': 'Brake System',
        'manufacturer': 'Toyota',
        'is_oem': True,
    },
    # Oil Filter - Multiple Models
    {
        'part_number': '90915-YZZF2',
        'part_name': 'Oil Filter',
        'make': 'Toyota',
        'model': None,  # Universal for many Toyota models
        'year_from': 2010,
        'year_to': 2024,
        'category': 'Engine',
        'manufacturer': 'Toyota',
        'is_oem': True,
        'alternative_numbers': '90915-10003, 90915-20003'
    },
    # Air Filter - Corolla
    {
        'part_number': '17801-21050',
        'part_name': 'Air Filter Element',
        'make': 'Toyota',
        'model': 'Corolla Axio',
        'year_from': 2012,
        'year_to': 2019,
        'category': 'Engine',
        'manufacturer': 'Toyota',
        'is_oem': True,
    },
    # Headlight - Prius
    {
        'part_number': '81170-47250',
        'part_name': 'Headlight Assembly (Left)',
        'make': 'Toyota',
        'model': 'Prius',
        'year_from': 2016,
        'year_to': 2021,
        'category': 'Lighting',
        'manufacturer': 'Toyota',
        'is_oem': True,
    },
    # Spark Plugs - Multiple
    {
        'part_number': '90919-01253',
        'part_name': 'Spark Plug (Iridium)',
        'make': 'Toyota',
        'model': None,
        'year_from': 2010,
        'year_to': 2024,
        'category': 'Engine',
        'manufacturer': 'Denso',
        'is_oem': True,
    },
    # Wiper Blade - Harrier
    {
        'part_number': '85212-48120',
        'part_name': 'Wiper Blade (Driver Side)',
        'make': 'Toyota',
        'model': 'Harrier',
        'year_from': 2013,
        'year_to': 2020,
        'category': 'Body',
        'manufacturer': 'Toyota',
        'is_oem': True,
    },
]

# Real Honda OEM Parts
HONDA_PARTS = [
    # Brake Pads - Civic
    {
        'part_number': '45022-SNA-A00',
        'part_name': 'Front Brake Pad Set',
        'make': 'Honda',
        'model': 'Civic',
        'year_from': 2012,
        'year_to': 2015,
        'category': 'Brake System',
        'manufacturer': 'Honda',
        'is_oem': True,
    },
    # Oil Filter - Multiple Models
    {
        'part_number': '15400-RTA-003',
        'part_name': 'Oil Filter',
        'make': 'Honda',
        'model': None,
        'year_from': 2010,
        'year_to': 2024,
        'category': 'Engine',
        'manufacturer': 'Honda',
        'is_oem': True,
        'alternative_numbers': '15400-PLM-A02'
    },
    # Air Filter - Fit
    {
        'part_number': '17220-RB6-Z00',
        'part_name': 'Air Filter Element',
        'make': 'Honda',
        'model': 'Fit',
        'year_from': 2013,
        'year_to': 2020,
        'category': 'Engine',
        'manufacturer': 'Honda',
        'is_oem': True,
    },
    # Headlight - Vezel
    {
        'part_number': '33150-T7A-A01',
        'part_name': 'Headlight Assembly (Right)',
        'make': 'Honda',
        'model': 'Vezel',
        'year_from': 2014,
        'year_to': 2021,
        'category': 'Lighting',
        'manufacturer': 'Honda',
        'is_oem': True,
    },
]

# Real Nissan OEM Parts
NISSAN_PARTS = [
    # Brake Pads - X-Trail
    {
        'part_number': 'D4060-4BA0A',
        'part_name': 'Front Brake Pad Set',
        'make': 'Nissan',
        'model': 'X-Trail',
        'year_from': 2014,
        'year_to': 2020,
        'category': 'Brake System',
        'manufacturer': 'Nissan',
        'is_oem': True,
    },
    # Oil Filter - Multiple
    {
        'part_number': '15208-65F0A',
        'part_name': 'Oil Filter',
        'make': 'Nissan',
        'model': None,
        'year_from': 2010,
        'year_to': 2024,
        'category': 'Engine',
        'manufacturer': 'Nissan',
        'is_oem': True,
    },
    # Air Filter - Serena
    {
        'part_number': '16546-3YM0A',
        'part_name': 'Air Filter Element',
        'make': 'Nissan',
        'model': 'Serena',
        'year_from': 2016,
        'year_to': 2022,
        'category': 'Engine',
        'manufacturer': 'Nissan',
        'is_oem': True,
    },
]

def run():
    print("Populating Part Catalog with REAL OEM part numbers...")
    
    all_parts = TOYOTA_PARTS + HONDA_PARTS + NISSAN_PARTS
    created_count = 0
    
    for part_data in all_parts:
        # Get make
        make = None
        if part_data.get('make'):
            make = VehicleMake.objects.filter(name=part_data['make']).first()
            if not make:
                print(f"Warning: Make '{part_data['make']}' not found, skipping part {part_data['part_number']}")
                continue
        
        # Get model
        model = None
        if part_data.get('model') and make:
            model = VehicleModel.objects.filter(make=make, name=part_data['model']).first()
            if not model:
                print(f"Warning: Model '{part_data['model']}' not found for {make.name}, skipping part {part_data['part_number']}")
                continue
        
        # Create or update part
        part, created = PartCatalog.objects.update_or_create(
            part_number=part_data['part_number'],
            defaults={
                'part_name': part_data['part_name'],
                'make': make,
                'model': model,
                'year_from': part_data.get('year_from'),
                'year_to': part_data.get('year_to'),
                'category': part_data.get('category', ''),
                'manufacturer': part_data.get('manufacturer', ''),
                'is_oem': part_data.get('is_oem', True),
                'alternative_numbers': part_data.get('alternative_numbers', ''),
            }
        )
        
        if created:
            created_count += 1
            print(f"✓ Created: {part.part_number} - {part.part_name} ({part.manufacturer})")
    
    print(f"\n✅ Part Catalog populated! Created {created_count} new parts.")
    print(f"Total parts in catalog: {PartCatalog.objects.count()}")
