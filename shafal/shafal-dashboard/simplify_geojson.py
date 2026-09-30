import json
import os

input_file = r'd:\Antigravity\Shafal\shafal-dashboard\public\data\bd-districts.json'
output_file = r'd:\Antigravity\Shafal\shafal-dashboard\public\data\bd-districts-opt.json'

print("Loading 46MB GeoJSON...")
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

def truncate_coords(coords):
    if isinstance(coords, list):
        if len(coords) == 2 and isinstance(coords[0], (int, float)) and isinstance(coords[1], (int, float)):
            return [round(coords[0], 2), round(coords[1], 2)]
        return [truncate_coords(c) for c in coords]
    return coords

def simplify_coords(coords):
    if len(coords) > 0 and isinstance(coords[0], list) and len(coords[0]) == 2 and isinstance(coords[0][0], (int, float)):
        if len(coords) <= 10: return coords
        new_coords = [coords[0]]
        for i in range(1, len(coords)-1):
            if i % 10 == 0: new_coords.append(coords[i])
        new_coords.append(coords[-1])
        return new_coords
    return [simplify_coords(c) for c in coords]

print("Simplifying geometry and truncating precision to 2 decimal places...")
for feature in data.get('features', []):
    geom = feature.get('geometry', {})
    if geom:
        coords = geom.get('coordinates', [])
        simplified = simplify_coords(coords)
        geom['coordinates'] = truncate_coords(simplified)

print("Saving optimized GeoJSON...")
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',', ':'))
print("Done! File saved as bd-districts-opt.json")
